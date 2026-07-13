import archiver from "archiver";
import { basename, join } from "path";
import sharp from "sharp";
import { once } from "events";
import {
  capitalizeFirstLetter,
  removeCommentsFromJSON,
  removeCommentsFromLang,
  getEnvironmentsForPath,
  isPathIncludedForEnvironment
} from "./utils";
import { compileCombinedAssets } from "./compileCombinedAssets";
import type { CombineResult } from "./types";
import { RES_ENVIRONMENTS } from "./data/pathEnvironments";
import {
  createWriteStream,
  existsSync,
  lstatSync,
  promises,
  readdirSync,
  statSync,
  unlinkSync,
  WriteStream
} from "fs";
import { readFile, readJsonSync } from "fs-extra";

/**
 * Files/Directories to exclude from build.
 */
const excludedFiles = [
  ".cursor",
  ".husky",
  ".github",
  ".vscode",
  ".git",
  "_build_check",
  "logs",
  "node_modules",
  "scripts",
  ".gitattributes",
  ".gitignore",
  ".mcattributes",
  "items.json",
  "jest.config.ts",
  "missing_info.md",
  "package-lock.json",
  "package.json",
  "tsconfig.json",
  "pokemon.json"
];

type RootPath = {
  relPath: string;
  realPath: string;
  environments: string[];
};

type BuildPlan = {
  environment: string;
  outputPaths: string[];
  basePaths: RootPath[];
  overlayPaths: RootPath[];
};

type ArchiveBundle = {
  archive: archiver.Archiver;
  outputs: WriteStream[];
};

type BuildRuntime = {
  environment: string;
  archive: archiver.Archiver;
  contents: { content: { path: string }[] };
  textures: string[];
  skipPaths: Set<string>;
  filesAdded: number;
  filesProcessed: number;
  progressTarget: number;
  lastProgressLogAt: number;
  skippedByEnv: number;
  skippedByCombined: number;
  atlasEntriesPruned: number;
};

type ArtifactSummary = {
  filePath: string;
  bytes: number;
};

const PROGRESS_LOG_EVERY = 500;

const textureAtlasPaths = new Set([
  "textures/item_texture.json",
  "textures/terrain_texture.json"
]);

/**
 * Checks if a given file path corresponds to an archive artifact (zip or mcpack).
 * @param filePath - The file path to check.
 * @returns True if the file path is an archive artifact, false otherwise.
 */
function isArchiveArtifactPath(filePath: string): boolean {
  return /\.(zip|mcpack)$/i.test(filePath);
}

/**
 * Normalizes a texture path for use in texture atlas entries.
 * It replaces backslashes with forward slashes, removes leading "./", and strips the file extension (.png or .tga).
 * If the resulting path does not start with "textures/", it prepends "textures/" to the path.
 * @param texturePath - The texture path to normalize.
 * @returns The normalized texture path.
 */
function normalizeAtlasTexturePath(texturePath: string): string {
  const normalizedPath = texturePath
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/\.(png|tga)$/i, "");

  return normalizedPath.startsWith("textures/")
    ? normalizedPath
    : `textures/${normalizedPath}`;
}

/**
 * Prunes texture atlas entries in the given atlas JSON object based on the specified environment.
 * It removes entries that reference textures not included in the specified environment.
 * @param parsedPath - The path of the atlas JSON file.
 * @param atlasJson - The parsed atlas JSON object.
 * @param environment - The environment to filter by.
 * @returns The number of entries removed.
 */
function pruneTextureAtlasEntriesByEnvironment(
  parsedPath: string,
  atlasJson: Record<string, unknown>,
  environment: string
): number {
  if (!textureAtlasPaths.has(parsedPath)) return 0;

  const textureData = atlasJson["texture_data"];
  if (!textureData || typeof textureData !== "object") return 0;

  let removedEntries = 0;
  const nextTextureData: Record<string, unknown> = {};

  for (const [entryKey, rawEntry] of Object.entries(textureData)) {
    if (!rawEntry || typeof rawEntry !== "object") {
      nextTextureData[entryKey] = rawEntry;
      continue;
    }

    const entry = rawEntry as { textures?: string | string[] };
    const textureRefs = Array.isArray(entry.textures)
      ? entry.textures.filter(
          (value): value is string => typeof value === "string"
        )
      : typeof entry.textures === "string"
        ? [entry.textures]
        : [];

    if (textureRefs.length === 0) {
      nextTextureData[entryKey] = rawEntry;
      continue;
    }

    const keepEntry = textureRefs.every((textureRef) =>
      isPathIncludedForEnvironment(
        normalizeAtlasTexturePath(textureRef),
        environment
      )
    );

    if (keepEntry) nextTextureData[entryKey] = rawEntry;
    else removedEntries++;
  }

  atlasJson["texture_data"] = nextTextureData;
  return removedEntries;
}

/**
 * Retrieves all root paths in the current directory, excluding archive artifacts and applying environment filters.
 * @returns An array of RootPath objects representing the root paths.
 */
function getAllPaths(): RootPath[] {
  return readdirSync(".")
    .filter((entryPath) => !isArchiveArtifactPath(entryPath))
    .map((entryPath) => ({
      relPath: entryPath,
      realPath: entryPath,
      environments: getEnvironmentsForPath(entryPath) ?? ["all"]
    }));
}

/**
 * Filters the provided root paths based on the specified environment.
 * It returns only those paths that are included in the given environment or marked as "all".
 * @param allPaths - An array of RootPath objects to filter.
 * @param environment - The environment to filter by.
 * @returns An array of RootPath objects included in the specified environment.
 */
function getPathsForEnvironment(
  allPaths: RootPath[],
  environment: string
): RootPath[] {
  return allPaths.filter(
    ({ environments }) =>
      environments.includes("all") || environments.includes(environment)
  );
}

/**
 * Generates the output paths for the resource pack based on the version and environment.
 * The output paths include both a .zip and a .mcpack file.
 */
function getOutputPaths(version: string, environment: string): string[] {
  const fileName = `PokeBedrock ${capitalizeFirstLetter(environment)} RES ${version}`;
  return [`${fileName}.zip`, `${fileName}.mcpack`];
}

/**
 * Creates a build plan for the specified environment, including output paths, base paths, and overlay paths.
 * @param allPaths - An array of all root paths in the current directory.
 * @param publicPaths - An array of root paths included in the "public" environment.
 * @param version - The version of the resource pack.
 * @param environment - The environment to create the build plan for.
 * @returns A BuildPlan object representing the build plan.
 */
function makeBuildPlan(
  allPaths: RootPath[],
  publicPaths: RootPath[],
  version: string,
  environment: string
): BuildPlan {
  if (environment === "public")
    return {
      environment,
      outputPaths: getOutputPaths(version, environment),
      basePaths: publicPaths,
      overlayPaths: []
    };

  const publicPathSet = new Set(publicPaths.map(({ relPath }) => relPath));
  const overlayPaths = getPathsForEnvironment(allPaths, environment).filter(
    ({ relPath }) => !publicPathSet.has(relPath)
  );

  return {
    environment,
    outputPaths: getOutputPaths(version, environment),
    basePaths: publicPaths,
    overlayPaths
  };
}

/**
 * Counts the total number of files in the provided root paths, excluding directories and archive artifacts.
 * @param paths - An array of RootPath objects to count files for.
 * @returns The total number of files in the provided paths.
 */
function countFilesForPaths(paths: RootPath[]): number {
  let total = 0;

  for (const { relPath, realPath } of paths) {
    if (excludedFiles.includes(relPath)) continue;
    if (isArchiveArtifactPath(relPath)) continue;
    if (!existsSync(realPath)) continue;

    const stat = lstatSync(realPath);

    if (stat.isDirectory()) {
      const stack = [realPath];

      while (stack.length > 0) {
        const current = stack.pop();
        if (!current) continue;

        const children = readdirSync(current);
        for (const child of children) {
          const childPath = join(current, child);
          const childStat = lstatSync(childPath);

          if (childStat.isDirectory()) stack.push(childPath);
          else if (childStat.isFile()) total++;
        }
      }
    } else if (stat.isFile()) total++;
  }

  return total;
}

/**
 * Logs the build progress based on the number of files processed and the total target.
 * It logs progress every PROGRESS_LOG_EVERY files processed.
 * @param runtime - The build runtime containing the current state of the build process.
 */
function logBuildProgress(runtime: BuildRuntime): void {
  runtime.filesProcessed++;
  if (runtime.filesProcessed - runtime.lastProgressLogAt < PROGRESS_LOG_EVERY)
    return;

  runtime.lastProgressLogAt = runtime.filesProcessed;
  const percent =
    runtime.progressTarget > 0
      ? ((runtime.filesProcessed / runtime.progressTarget) * 100).toFixed(1)
      : "100.0";

  console.log(
    `[${runtime.environment}] progress ${runtime.filesProcessed}/${runtime.progressTarget} (${percent}%)`
  );
}

/**
 * Creates a new archive bundle for the specified output paths.
 * Each output path will have its own archive and write stream.
 * @param outputPaths - The output paths for which to create archives.
 * @returns An object containing the archive and write streams for each output path.
 */
function makeArchives(outputPaths: string[]): ArchiveBundle {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const outputs: WriteStream[] = [];

  for (const fileName of outputPaths) {
    if (existsSync(fileName)) unlinkSync(fileName);
    const output = createWriteStream(fileName);

    outputs.push(output);
  }

  archive.on("warning", (err) => {
    if (err.code === "ENOENT") console.warn(err);
    else throw err;
  });

  archive.on("error", (err) => {
    throw err;
  });

  for (const output of outputs) archive.pipe(output);

  return { archive, outputs };
}

/**
 * Adds a path to a archive, and compressing files.
 * Files present in `skipPaths` are skipped (handled by the combined-asset compiler).
 */
async function addPathToArchive(
  pathToAdd: string,
  runtime: BuildRuntime
): Promise<void> {
  const pathStat = await promises.lstat(pathToAdd);
  const parsedPath = pathToAdd.replace(/\\/g, "/");

  if (
    !pathStat.isDirectory() &&
    !isPathIncludedForEnvironment(parsedPath, runtime.environment)
  ) {
    runtime.skippedByEnv++;
    logBuildProgress(runtime);
    return;
  }

  if (pathStat.isDirectory()) {
    const items = await promises.readdir(pathToAdd);
    for (const item of items)
      await addPathToArchive(join(pathToAdd, item), runtime);
  } else if (pathStat.isFile()) {
    if (runtime.skipPaths.has(parsedPath)) {
      runtime.skippedByCombined++;
      logBuildProgress(runtime);
      return;
    }

    runtime.contents.content.push({ path: parsedPath });
    runtime.filesAdded++;
    const ext = pathToAdd.split(".").pop();

    switch (ext) {
      // JSON files can have comments, and extra spaces, we want to remove those
      case "json":
        // Compress JSON file
        try {
          const fileContents = await readFile(pathToAdd, "utf-8");
          const commentsRemoved = removeCommentsFromJSON(fileContents);
          const parsedJson = JSON.parse(commentsRemoved);
          runtime.atlasEntriesPruned += pruneTextureAtlasEntriesByEnvironment(
            parsedPath,
            parsedJson,
            runtime.environment
          );

          const compressedContents = JSON.stringify(parsedJson);

          // Add the compressed JSON content as a temporary file
          runtime.archive.append(compressedContents, { name: pathToAdd });
        } catch (error) {
          throw new Error(`Error compressing JSON: ${pathToAdd}: ${error}`);
        }
        break;

      // PNG files are compressed using the sharp library
      case "png":
        if (pathToAdd.startsWith("textures")) runtime.textures.push(parsedPath);

        // Compress PNG file
        try {
          const compressedBuffer = await sharp(pathToAdd).png().toBuffer();

          // Add the compressed PNG content as a temporary file in memory
          runtime.archive.append(compressedBuffer, { name: pathToAdd });
        } catch (error) {
          console.error(`Error compressing PNG: ${pathToAdd}:`, error);
        }
        break;

      // Material JSON files can have comments, we want to remove those
      case "material":
        try {
          const fileContents = await readFile(pathToAdd, "utf-8");
          const commentsRemoved = removeCommentsFromJSON(fileContents);
          const parsedJson = JSON.parse(commentsRemoved);
          let compressedContents = JSON.stringify(parsedJson, null, 2);

          // Replace Unix line endings with CRLF (Windows-style)
          compressedContents = compressedContents.replace(/\n/g, "\r\n");

          // Add the parsed Material content as a temporary file
          runtime.archive.append(compressedContents, { name: pathToAdd });
        } catch (error) {
          console.error(`Error parsing JSON (material): ${pathToAdd}:`, error);
        }
        break;

      // Lang can have comments, and extra spaces, we want to remove those
      case "lang":
        try {
          const fileContents = await readFile(pathToAdd, "utf-8");
          const commentsRemoved = removeCommentsFromLang(fileContents);
          const compressedContents = commentsRemoved;

          // Add the compressed Lang content as a temporary file
          runtime.archive.append(compressedContents, { name: pathToAdd });
        } catch (error) {
          console.error(`Error compressing Lang: ${pathToAdd}:`, error);
        }
        break;
      default:
        runtime.archive.file(pathToAdd, { name: pathToAdd });
    }

    logBuildProgress(runtime);
  } else console.warn(`[WARN] Unknown path type: ${pathToAdd}`);
}

/**
 * Adds paths to the archive for the specified environment.
 * @param pathsForEnvironment - The paths to add for the environment.
 * @param outputPaths - The output paths to consider for exclusion.
 * @param runtime - The build runtime containing the archive and metadata.
 */
async function addPathsToArchives(
  pathsForEnvironment: RootPath[],
  outputPaths: string[],
  runtime: BuildRuntime
): Promise<void> {
  for (const entry of pathsForEnvironment) {
    const relPath = entry.relPath;
    const realPath = entry.realPath;

    if (excludedFiles.includes(relPath)) continue;
    if (isArchiveArtifactPath(relPath)) continue;
    if (!existsSync(realPath)) continue;
    if (
      outputPaths.some((outputPath) => {
        const [stem] = outputPath.split(".");
        const prefix = stem && stem.length > 0 ? stem : outputPath;
        return relPath.startsWith(prefix);
      })
    )
      continue;

    if (lstatSync(realPath).isDirectory())
      await addPathToArchive(realPath, runtime);
    else await addPathToArchive(realPath, runtime);
  }
}

/**
 * Appends generated entries to the archive and updates the runtime contents.
 * @param generatedEntries - The generated entries to append.
 * @param runtime - The build runtime containing the archive and metadata.
 */
function appendGeneratedEntries(
  generatedEntries: CombineResult["generatedEntries"],
  runtime: BuildRuntime
): void {
  for (const entry of generatedEntries) {
    runtime.contents.content.push({ path: entry.archivePath });
    runtime.archive.append(entry.content, { name: entry.archivePath });
  }
}

/**
 * Appends metadata files (contents.json and textures_list.json) to the archive.
 * @param runtime - The build runtime containing the archive and metadata.
 */
function appendMetadataFiles(runtime: BuildRuntime): void {
  runtime.archive.append(JSON.stringify(runtime.contents), {
    name: "contents.json"
  });
  runtime.archive.append(JSON.stringify(runtime.textures), {
    name: "textures/textures_list.json"
  });
}

/**
 * Finalizes the archive bundle by closing the archive and ensuring all data is written.
 * @param archiveBundle - The archive bundle containing the archive and output streams.
 */
async function finalizeArchives(
  archiveBundle: ArchiveBundle
): Promise<ArtifactSummary[]> {
  await archiveBundle.archive.finalize();

  await Promise.all(
    archiveBundle.outputs.map((output) => once(output, "close"))
  );

  return archiveBundle.outputs.map((output) => {
    const filePath = String(output.path);
    return {
      filePath,
      bytes: statSync(filePath).size
    };
  });
}

/**
 * Builds the resource pack for a specific environment.
 * @param plan - The build plan containing environment, output paths, and paths for the environment.
 */
async function buildEnvironment(plan: BuildPlan): Promise<void> {
  console.log(`\n=== Building ${plan.environment.toUpperCase()} ===`);

  const archiveBundle = makeArchives(plan.outputPaths);
  // Combined assets are generated for the full effective target view (base + overlay).
  const combineResult = compileCombinedAssets(plan.environment);
  const progressTarget =
    countFilesForPaths(plan.basePaths) + countFilesForPaths(plan.overlayPaths);
  const runtime: BuildRuntime = {
    environment: plan.environment,
    archive: archiveBundle.archive,
    contents: { content: [] },
    textures: [],
    skipPaths: combineResult.skipPaths,
    filesAdded: 0,
    filesProcessed: 0,
    progressTarget,
    lastProgressLogAt: 0,
    skippedByEnv: 0,
    skippedByCombined: 0,
    atlasEntriesPruned: 0
  };

  console.log(
    `[${plan.environment}] archiving ${runtime.progressTarget} file candidates...`
  );

  await addPathsToArchives(plan.basePaths, plan.outputPaths, runtime);
  await addPathsToArchives(plan.overlayPaths, plan.outputPaths, runtime);
  appendGeneratedEntries(combineResult.generatedEntries, runtime);
  appendMetadataFiles(runtime);
  const artifacts = await finalizeArchives(archiveBundle);

  console.log(
    `Done ${plan.environment}: files=${runtime.filesAdded}, skipped(env)=${runtime.skippedByEnv}, skipped(combined)=${runtime.skippedByCombined}, atlas-pruned=${runtime.atlasEntriesPruned}`
  );
  for (const artifact of artifacts)
    console.log(
      `  - ${basename(artifact.filePath)}: ${(artifact.bytes / 1024 ** 2).toFixed(2)}MB`
    );
}

/**
 * Retrieves the version from the manifest.json file.
 * @returns The version string in the format "major.minor.patch".
 */
function getVersion(): string {
  const manifest = readJsonSync("manifest.json", "utf8");
  return manifest.header.version.join(".");
}

/**
 * Runs the build process for all environments defined in RES_ENVIRONMENTS.
 * It checks for the existence of 'manifest.json', retrieves the version,
 * and builds the resource packs for each environment.
 */
async function runBuild(): Promise<void> {
  if (!existsSync("manifest.json")) {
    console.error("manifest.json not found.");
    process.exit(1);
  }

  const version = getVersion();
  const allPaths = getAllPaths();
  const publicPaths = getPathsForEnvironment(allPaths, "public");
  const environments = ["public", ...RES_ENVIRONMENTS];

  for (const environment of environments) {
    const plan = makeBuildPlan(allPaths, publicPaths, version, environment);
    await buildEnvironment(plan);
  }
}

(async () => {
  try {
    await runBuild();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
})();

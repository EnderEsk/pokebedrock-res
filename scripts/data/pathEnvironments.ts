/**
 * This file defines the different environments in which a file path can be included.
 * It is used to determine which files should be included in the build based on the
 * specified environment.
 */
export const RES_ENVIRONMENTS = ["adventure", "survival"] as const;

/**
 * Represents the environment(s) in which a specific file path should be included.
 * This is used to determine which files should be included in the build based on
 * the specified environment.
 */
interface PathEnvironmentMap {
  /**
   * The key is a file path pattern (e.g., "subpacks/**") and the value is an array
   * of environments in which the files matching that pattern should be included.
   */
  [key: string]: ((typeof RES_ENVIRONMENTS)[number] | "all")[];
}

/**
 * Maps file paths to their corresponding environments.
 * This is used to determine which files should be included in the build
 * based on the specified environment.
 */
export const RES_PATH_ENVIRONMENTS: PathEnvironmentMap = {
  "animations/server_npc/**": ["survival", "adventure"],
  "animations/crate.animations.json": ["survival"],
  "animations/server_npc.animation.json": ["survival", "adventure"],
  "entity/crate.json": ["survival"],
  "entity/server_npc.json": ["survival", "adventure"],
  "models/blocks/crate.json": ["survival"],
  "models/entity/server_npc/**": ["survival", "adventure"],
  "models/entity/server_npc.json": ["survival", "adventure"],
  "particles/crate/**": ["survival"],
  "render_controllers/crate.json": ["survival"],
  "render_controllers/server_npc.json": ["survival"],
  "subpacks/**": ["all"],
  "textures/entity/server_npc.json": ["survival", "adventure"],
  "textures/entity/hub_npcs/**": ["all"], // Thought these were in a different resource pack? hmm
  "textures/entity/server_npc/**": ["survival", "adventure"],
  "textures/items/crate_keys/**": ["survival"],
  "textures/items/server_npc_spawn_egg.png": ["survival", "adventure"],
  "textures/items/crate_spawn_egg.png": ["survival"],
  "textures/sprites/**": ["all"],
  "textures/ui/quests/**": ["survival", "adventure"]
};

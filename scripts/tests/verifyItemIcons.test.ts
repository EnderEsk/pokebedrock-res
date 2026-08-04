import fs from "fs";
import path from "path";
import type { IItemsJson, ItemTextureFile } from "../types";
import { readJsonFileStrippingComments } from "../utils";

/**
 * A file that contains all the items in the PokeBedrock behavior pack.
 */
const itemsJsonPath = path.join(process.cwd(), "items.json");

/**
 * Path to the item_texture.json file which stores all key-value pairs of item icons.
 */
const itemTexturesPath = path.join(
  process.cwd(),
  "textures",
  "item_texture.json"
);

test("Verify's that all item icons are present", async () => {
  if (!fs.existsSync(itemTexturesPath))
    throw new Error("item_texture.json not found");
  const itemTextures = readJsonFileStrippingComments(
    itemTexturesPath
  ) as ItemTextureFile | null;
  if (!itemTextures) throw new Error("item_texture.json could not be parsed");

  if (!fs.existsSync(itemsJsonPath)) throw new Error("items.json not found");
  // items.json keeps disabled entries around as `//` comments, which JSON.parse
  // rejects outright. Bedrock tolerates them, so they are stripped here rather
  // than deleted from the file.
  const items = readJsonFileStrippingComments(itemsJsonPath) as IItemsJson | null;
  if (!items) throw new Error("items.json could not be parsed");

  // Creates a set with all the unique item icons.
  const itemIcons = new Set(Object.values(items));

  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  for (const icon of itemIcons) {
    const iconData = itemTextures.texture_data[icon];
    if (iconData) {
      // Ensure icon exists.
      const textures = iconData["textures"];
      if (!textures) {
        console.error(`Icon '${icon}' has no textures`);
        continue;
      }
      for (let iconPath of Array.isArray(textures) ? textures : [textures]) {
        if (!iconPath.endsWith(".png")) iconPath += ".png";
        if (!fs.existsSync(path.join(process.cwd(), iconPath))) {
          console.error(`Icon '${icon}' not found at path '${iconPath}'`);
        }
      }
    } else {
      console.error(`Icon '${icon}' not found in item_texture.json`);
    }
  }

  // Assert that console.error was not called
  expect(consoleErrorSpy).not.toHaveBeenCalled();

  // Restore console.error after the test
  consoleErrorSpy.mockRestore();
});

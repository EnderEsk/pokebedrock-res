/**
 * Battle UI - Progress Bar Elements
 *
 * HP bars, PP bars, and progress-related UI elements.
 */

import {
  panel,
  image,
  extendRaw,
  collectionBinding,
  viewBinding,
  skip,
  first,
  type NamespaceBuilder,
} from "mcbe-ts-ui";

import { NS } from "./shared";

/** Base PP bar for move display */
export const ppBar = image("pp_bar", "textures/ui/battle/white_shaded")
  .color([0.1, 0.6, 1])
  .layer(10)
  .anchor("bottom_left")
  .fill()
  .size("40%", "29%")
  .offset("30.3%", "19%")
  .variableDefault("bar", "")
  .bindings(
    collectionBinding("#form_button_texture"),
    viewBinding(`(${skip(2, "#form_button_texture")} = $bar)`, "#visible")
  );

/** Variable progress bar for HP display */
export const variableProgressBar = image(
  "variable_progress_bar",
  "textures/ui/filled_progress_bar"
)
  .layer(2)
  .clipPixelPerfect(false)
  .clipDirection("left")
  .variableDefault("color_id", "G")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      `( ${first(3, skip(60, "#form_button_text"))} * 1 )`,
      "#clip_ratio"
    ),
    viewBinding(
      `(${first(1, skip(58, "#form_button_text"))} = $color_id)`,
      "#visible"
    )
  );

/** Dynamic progress bar with color variants (green/yellow/red) */
const dynamicProgressBar = panel("dynamic_progress_bar")
  .fullSize()
  .anchor("center")
  .controls(
    extendRaw("empty_progress_bar", "common.empty_progress_bar", {
      layer: 1,
    }),
    extendRaw("green", `${NS}.variable_progress_bar`, {
      $color_id: "G",
      color: [0.5, 1.0, 0.5, 1.0],
    }),
    extendRaw("yellow", `${NS}.variable_progress_bar`, {
      $color_id: "Y",
      color: [1, 0.9, 0, 1.0],
    }),
    extendRaw("red", `${NS}.variable_progress_bar`, {
      $color_id: "R",
      color: [1, 0, 0, 1.0],
    })
  );

/**
 * Creates PP bar controls for every supported PP value.
 *
 * @returns PP bar controls for null and values 0 through 20.
 */
export function createPpBarVariants() {
  return ["null", ...Array.from({ length: 21 }, (_, i) => i)].map((i) => {
    const barVal = i === "null" ? "_null" : `_${i}`;
    const sizePercent =
      i === "null" || i === 0
        ? "0%"
        : `${Number((Number(i) * 1.965).toFixed(3))}%`;

    return extendRaw(String(i), `${NS}.pp_bar`, {
      $bar: barVal,
      size: [sizePercent, "29%"],
    });
  });
}

/**
 * Register progress elements to the namespace.
 *
 * @param ns The battle UI namespace.
 */
export function registerProgressElements(ns: NamespaceBuilder): void {
  ppBar.addToNamespace(ns);
  variableProgressBar.addToNamespace(ns);
  dynamicProgressBar.addToNamespace(ns);
}

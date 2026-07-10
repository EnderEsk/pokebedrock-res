import {
  defineUI,
  phudVisibility,
  phudRead,
  viewBinding,
  image,
  boundLabel,
  ref,
} from "mcbe-ts-ui";

export const NAMESPACE = "phud_loadingScreen";
export const INSTANCE = "loadingScreen";

const loadingText = boundLabel("text")
  .layer(1002)
  .localize()
  .textAlignment("center")
  .bindings(
    phudRead("#loadingScreen", "#loadingScreenText"),
    viewBinding("(#loadingScreenText)", "#text")
  );

export const main = image("main", "textures/ui/background")
  .tiled()
  .tiledScale(2, 2)
  .layer(1000)
  .fullSize()
  .controls(loadingText)
  .bindings(...phudVisibility("#loadingScreen"));

/** Cross-namespace mount into `phud.elements`. */
export const mainRef = (overrides: Record<string, unknown> = {}) =>
  ref(`${INSTANCE}@${NAMESPACE}.${main.getName()}`, overrides);

export default defineUI(NAMESPACE, main);

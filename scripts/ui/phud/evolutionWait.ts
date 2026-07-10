import {
  defineUI,
  image,
  phudVisibility,
  phudRead,
  fromRGB,
  boundLabel,
  ref,
} from "mcbe-ts-ui";

export const NAMESPACE = "phud_evolutionWait";
export const INSTANCE = "evolutionWait";

const evolutionText = boundLabel("text")
  .color(fromRGB(128, 128, 128))
  .layer(1002)
  .localize()
  .fontType("MinecraftTen")
  .textAlignment("center")
  .bindings(phudRead("#evolutionWait", "#text"));

export const main = image("main", "textures/ui/evolution_box")
  .layer(1000)
  .anchor("bottom_middle")
  .size("70%", "100%")
  .offset(0, "32%")
  .controls(evolutionText)
  .bindings(...phudVisibility("#evolutionWait"));

/** Cross-namespace mount into `phud.elements`. */
export const mainRef = (overrides: Record<string, unknown> = {}) =>
  ref(`${INSTANCE}@${NAMESPACE}.${main.getName()}`, overrides);

export default defineUI(NAMESPACE, main);

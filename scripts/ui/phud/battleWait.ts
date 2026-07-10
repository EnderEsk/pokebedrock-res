import {
  defineUI,
  fromRGB,
  hudSubtitleBinding,
  image,
  boundLabel,
  phudRead,
  phudVisibility,
  stackPanel,
  viewBinding,
  ref,
} from "mcbe-ts-ui";

export const NAMESPACE = "phud_battleWait";
export const INSTANCE = "battle_wait";

const battleLogText = boundLabel("text")
  .anchor("top_middle")
  .layer(1002)
  .localize()
  .fontSize("normal")
  .offset(0, 0)
  .textAlignment("center")
  .bindings(
    phudRead("#battleLog", "#log_text"),
    viewBinding("#log_text", "#text")
  );

const menuExtra = image("menu_extra", "textures/ui/battle/white_transparency")
  .color(fromRGB(35, 32, 32))
  .rawProp("keep_ratio", true)
  .layer(2)
  .fill()
  .anchor("bottom_left")
  .size("85%", "100%")
  .controls(battleLogText);

const infoLabel = boundLabel("info_label")
  .color("default")
  .alpha(1)
  .rawProp("localize", false)
  .fontScaleFactor(1)
  .textAlignment("center")
  .size("fill", "100%")
  .anchor("center")
  .rawProp("shadow", false)
  .layer(3)
  .bindings(hudSubtitleBinding());

const mainHolder = stackPanel("main_holder", "horizontal")
  .size("100%", "95%")
  .anchor("bottom_left")
  .controls(menuExtra, infoLabel);

export const main = image("main", "textures/ui/battle/white_transparency")
  .color(fromRGB(191, 43, 54))
  .rawProp("keep_ratio", true)
  .layer(1000)
  .fill()
  .anchor("bottom_left")
  .size("100%", "30%")
  .controls(mainHolder)
  .bindings(...phudVisibility("#battleLog"));

/** Cross-namespace mount into `phud.elements`. */
export const mainRef = (overrides: Record<string, unknown> = {}) =>
  ref(`${INSTANCE}@${NAMESPACE}.${main.getName()}`, overrides);

export default defineUI(NAMESPACE, main);

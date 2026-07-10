import {
  defineUI,
  image,
  boundLabel,
  panel,
  stackPanel,
  phudVisibility,
  phudRead,
  firstStripped,
  skipStripped,
  fromRGB,
  ref,
} from "mcbe-ts-ui";

export const NAMESPACE = "phud_currency";
export const INSTANCE = "currency";

/**
 * The variable size of currency display.
 * First 80 Chars shows the current quest, the rest shows the amount of currency.
 *
 * @see pokebedrock-beh/src/pokebedrock-server/modules/events/topUiManager.ts#L41
 */
const VARIABLE_SIZE = 80;
const FONT_SCALE = 1;
const COLOR = fromRGB(255, 255, 133);

const questLabel = boundLabel("quest_label")
  .layer(3)
  .fontScaleFactor(FONT_SCALE)
  .color(COLOR)
  .bindings(
    phudRead("#level_number", "#text", firstStripped(VARIABLE_SIZE, "${prop}"))
  );

const quest = image("quest", "textures/ui/hud_tip_text_background")
  .padChildren(12, 5)
  .alpha(0.6)
  .controls(questLabel);

const currencyLabel = boundLabel("currency_label")
  .layer(3)
  .fontScaleFactor(FONT_SCALE)
  .color(COLOR)
  .bindings(
    phudRead("#level_number", "#text", skipStripped(VARIABLE_SIZE, "${prop}"))
  );

const currency = image("currency", "textures/ui/hud_tip_text_background")
  .padChildren(12, 5)
  .alpha(0.6)
  .controls(currencyLabel);

const stackPanelElement = stackPanel("stack_panel", "horizontal")
  .wrapChildren()
  .controls(quest, panel("separator").size(3, 0), currency);

export const main = panel("main")
  .size("100%cm", "100%cm")
  .anchor("top_middle")
  .offset(0, 8)
  .controls(stackPanelElement)
  .bindings(...phudVisibility("#level_number"));

/** Cross-namespace mount into `phud.elements`. */
export const mainRef = (overrides: Record<string, unknown> = {}) =>
  ref(`${INSTANCE}@${NAMESPACE}.${main.getName()}`, overrides);

export default defineUI(NAMESPACE, main);

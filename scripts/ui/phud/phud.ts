import {
  Binding,
  defineUI,
  extend,
  hudTitleBinding,
  panel,
  preservedTextBinding,
  ref,
  siblingViewBinding,
  strip,
  viewBinding,
} from "mcbe-ts-ui";

import { mainRef as currencyRef } from "./currency";
import { mainRef as phoneRef } from "./phone";
import { mainRef as battleWaitRef } from "./battleWait";
import { mainRef as loadingScreenRef } from "./loadingScreen";
import { mainRef as evolutionWaitRef } from "./evolutionWait";
import { mainRef as sidebarRef } from "./sidebar";

interface HudDataControl {
  updateString: string;
  /** Data-control name under `renderers` (must be unique). */
  controlName: string;
  bindingTarget: string;
}

// Match main hand-authored phud.json naming: *_data_control vs short element names.
const HUD_DATA_CONTROLS: HudDataControl[] = [
  {
    updateString: "&_currency:",
    controlName: "currency_data_control",
    bindingTarget: "#level_number",
  },
  {
    updateString: "&_phone:",
    controlName: "phone_data_control",
    bindingTarget: "#phone",
  },
  {
    updateString: "&_battleWait:",
    controlName: "battle_wait_control",
    bindingTarget: "#battleLog",
  },
  {
    updateString: "&_loadingScreen:",
    controlName: "loading_screen_control",
    bindingTarget: "#loadingScreen",
  },
  {
    updateString: "&_evolutionWait:",
    controlName: "evolution_wait_control",
    bindingTarget: "#evolutionWait",
  },
  {
    updateString: "&_sidebar:",
    controlName: "sidebar_control",
    bindingTarget: "#sidebar",
  },
  {
    updateString: "&_playerPing:",
    controlName: "player_ping_control",
    bindingTarget: "#player_ping_text",
    // Rendered from hud_screen chat_stack, not phud.elements.
  },
];

const siblingBindings = (): Binding[] =>
  HUD_DATA_CONTROLS.map(({ controlName, updateString, bindingTarget }) =>
    siblingViewBinding(
      controlName,
      strip("#preserved_text", updateString),
      bindingTarget
    )
  );

const dataControl = panel("data_control")
  .size(0, 0)
  .bindings(
    hudTitleBinding(),
    preservedTextBinding(),
    viewBinding(
      "(not (#hud_title_text_string = #preserved_text) and not ((#hud_title_text_string - $update_string) = #hud_title_text_string))",
      "#visible"
    )
  );

const elements = panel("elements")
  .variable("offset", [0, 0])
  .rawProp("offset", "$offset")
  .rawProp("variables", [{ requires: "$pocket_screen", $offset: [0, 10] }])
  .bindings(...siblingBindings())
  .controls(
    currencyRef(),
    phoneRef({
      size: [64, 64],
      offset: [8, 0],
      anchor_from: "left_middle",
      anchor_to: "left_middle",
    }),
    battleWaitRef(),
    loadingScreenRef(),
    evolutionWaitRef(),
    sidebarRef({ $color: "white" })
  );

export const NAMESPACE = "phud";

/** Cross-namespace mount into `hud_screen` root_panel. */
export const mainRef = ref(`${NAMESPACE}@${NAMESPACE}.main`);

export default defineUI(NAMESPACE, (ns) => {
  const dataControlEl = dataControl.addToNamespace(ns);
  const renderers = panel("renderers").controls(
    ...HUD_DATA_CONTROLS.map(({ controlName, updateString }) =>
      extend(controlName, dataControlEl).variable("update_string", updateString)
    )
  );

  return ns.setMain(panel("main").fullSize().controls(renderers, elements));
});

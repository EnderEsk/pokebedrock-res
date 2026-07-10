import {
  Binding,
  ControlReference,
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

interface HudComponent {
  updateString: string;
  /** Data-control name under `renderers` (must be unique from elementName). */
  controlName: string;
  /** Visible element instance name under `elements`. */
  elementName?: string;
  bindingTarget: string;
  namespace?: string;
  /** Overrides applied on the element instance in `elements`. */
  elementOverrides?: Record<string, unknown>;
}

// Match main hand-authored phud.json naming: *_data_control vs short element names.
const HUD_COMPONENTS: HudComponent[] = [
  {
    updateString: "&_currency:",
    controlName: "currency_data_control",
    elementName: "currency",
    bindingTarget: "#level_number",
    namespace: "phud_currency",
  },
  {
    updateString: "&_phone:",
    controlName: "phone_data_control",
    elementName: "phone",
    bindingTarget: "#phone",
    namespace: "phud_phone",
    elementOverrides: {
      size: [64, 64],
      offset: [8, 0],
      anchor_from: "left_middle",
      anchor_to: "left_middle",
    },
  },
  {
    updateString: "&_battleWait:",
    controlName: "battle_wait_control",
    elementName: "battle_wait",
    bindingTarget: "#battleLog",
    namespace: "phud_battleWait",
  },
  {
    updateString: "&_loadingScreen:",
    controlName: "loading_screen_control",
    elementName: "loadingScreen",
    bindingTarget: "#loadingScreen",
    namespace: "phud_loadingScreen",
  },
  {
    updateString: "&_evolutionWait:",
    controlName: "evolution_wait_control",
    elementName: "evolutionWait",
    bindingTarget: "#evolutionWait",
    namespace: "phud_evolutionWait",
  },
  {
    updateString: "&_sidebar:",
    controlName: "sidebar_control",
    elementName: "sidebar",
    bindingTarget: "#sidebar",
    namespace: "phud_sidebar",
    elementOverrides: { $color: "white" },
  },
  {
    updateString: "&_playerPing:",
    controlName: "player_ping_control",
    bindingTarget: "#player_ping_text",
    // Rendered from hud_screen chat_stack, not phud.elements.
  },
];

export default defineUI("phud", (ns) => {
  const [dataControl, ns1] = ns.add(
    panel("data_control")
      .size(0, 0)
      .bindings(
        hudTitleBinding(),
        preservedTextBinding(),
        viewBinding(
          "(not (#hud_title_text_string = #preserved_text) and not ((#hud_title_text_string - $update_string) = #hud_title_text_string))",
          "#visible"
        )
      )
  );

  const siblingBindings = (): Binding[] =>
    HUD_COMPONENTS.map(({ controlName, updateString, bindingTarget }) =>
      siblingViewBinding(
        controlName,
        strip("#preserved_text", updateString),
        bindingTarget
      )
    );

  const elementRefs = (): ControlReference[] =>
    HUD_COMPONENTS.filter((c) => c.namespace && c.elementName).map(
      ({ elementName, namespace, elementOverrides }) =>
        ref(`${elementName}@${namespace}.main`, elementOverrides)
    );

  const renderers = panel("renderers").controls(
    ...HUD_COMPONENTS.map(({ controlName, updateString }) =>
      extend(controlName, dataControl).variable("update_string", updateString)
    )
  );

  const elements = panel("elements")
    .variable("offset", [0, 0])
    .rawProp("offset", "$offset")
    .rawProp("variables", [{ requires: "$pocket_screen", $offset: [0, 10] }])
    .bindings(...siblingBindings())
    .controls(...elementRefs());

  return ns1.setMain(panel("main").fullSize().controls(renderers, elements));
});

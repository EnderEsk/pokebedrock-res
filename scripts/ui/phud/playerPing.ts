import {
  defineUI,
  image,
  label,
  stackPanel,
  phudVisibility,
  ref,
} from "mcbe-ts-ui";

export const NAMESPACE = "player_ping";

/**
 * Localized "Ping: " prefix + dynamic value.
 * `%s`/`with` substitution does NOT work on JSON UI labels — split static
 * localized label from bound value (see AGENTS.md / wiki.bedrock.dev).
 */
const labelPrefix = label("label_prefix", "phud.playerPing.label")
  .size("default", "default")
  .localize()
  .rawProp("enable_profanity_filter", false)
  .color("$chat_text_color")
  .shadow();

const valueText = label("value_text", "#text")
  .size("default", "default")
  .rawProp("localize", false)
  .rawProp("enable_profanity_filter", false)
  .color("$chat_text_color")
  .shadow()
  .bindings({
    binding_name: "#player_ping_text",
    binding_type: "view",
    source_control_name: "elements",
    source_property_name: "(#player_ping_text - '_')",
    target_property_name: "#text",
  });

const content = stackPanel("content", "horizontal")
  .size("100%c", "10px")
  .anchor("bottom_middle")
  .layer(1)
  .controls(labelPrefix, valueText);

export const main = image("main", "textures/ui/Black")
  .size("100%c + 6px", "100%c + 2px")
  .alpha(0.7)
  .controls(content)
  .bindings(
    ...phudVisibility("#player_ping_text"),
    {
      binding_name: "#hud_text_background_alpha",
      binding_name_override: "#alpha",
    }
  );

/** Cross-namespace mount into `hud_screen` chat_stack. */
export const mainRef = ref(`${NAMESPACE}@${NAMESPACE}.${main.getName()}`);

export default defineUI(NAMESPACE, main);

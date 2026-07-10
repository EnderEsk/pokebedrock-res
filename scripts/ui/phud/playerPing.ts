import {
  defineUI,
  image,
  label,
  stackPanel,
  phudVisibility,
} from "mcbe-ts-ui";

/**
 * Localized "Ping: " prefix + dynamic value.
 * `%s`/`with` substitution does NOT work on JSON UI labels — split static
 * localized label from bound value (see AGENTS.md / wiki.bedrock.dev).
 */
const content = stackPanel("content", "horizontal")
  .size("100%c", "10px")
  .anchor("bottom_middle")
  .layer(1)
  .controls(
    label("label_prefix", "phud.playerPing.label")
      .size("default", "default")
      .localize()
      .rawProp("enable_profanity_filter", false)
      .color("$chat_text_color")
      .shadow(),
    label("value_text", "#text")
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
      })
  );

export default defineUI(
  "player_ping",
  image("main", "textures/ui/Black")
    .size("100%c + 6px", "100%c + 2px")
    .alpha(0.7)
    .controls(content)
    .bindings(
      ...phudVisibility("#player_ping_text"),
      {
        binding_name: "#hud_text_background_alpha",
        binding_name_override: "#alpha",
      }
    )
);

/**
 * Vanilla HUD overlay: PHUD mount, ping, title hide for `&_` tokens,
 * and bottom-bar reposition.
 */

import {
  redefineUI,
  panel,
  element,
  ref,
  globalBinding,
  viewBinding,
  first,
  equals,
  not,
} from "mcbe-ts-ui";

import { mainRef as phudMain } from "./phud/phud";
import { mainRef as playerPingMain } from "./phud/playerPing";

/** Hide vanilla title when a PHUD token (`&_...`) is on the title string. */
const hidePhudTitleBindings = [
  globalBinding("#hud_title_text_string"),
  viewBinding(
    not(equals(first(1, "#hud_title_text_string"), "&_")),
    "#visible"
  ),
];

const bottomLeftBar = (
  name: string,
  offset: [number, number],
  bindings?: { binding_name: string; binding_name_override: string }[]
) =>
  ref(name, {
    offset,
    anchor_from: "bottom_left",
    anchor_to: "bottom_left",
    ...(bindings ? { bindings } : {}),
  });

const centeredHud = panel("centered_gui_elements_at_bottom_middle")
  .anchor("bottom_middle")
  .size(180, 50)
  .controls(
    bottomLeftBar("heart_rend@heart_renderer", [-1, -40]),
    bottomLeftBar("armor_rend@armor_renderer", [-1, -40]),
    bottomLeftBar("hunger_rend@hunger_renderer", [180, -40]),
    bottomLeftBar("bubbles_rend_0@bubbles_renderer", [180, -50], [
      { binding_name: "#is_not_riding", binding_name_override: "#visible" },
    ]),
    bottomLeftBar("bubbles_rend_1@bubbles_renderer", [180, -70], [
      { binding_name: "#is_riding", binding_name_override: "#visible" },
    ]),
    ref("exp_rend@exp_progress_bar_and_hotbar")
  )
  .bindings(
    globalBinding("#hud_visible_centered", "#visible")
  );

export default redefineUI("hud_screen", (ns) => {
  element("hud_title_text")
    .size("100%", "100%")
    .offset(0, 0)
    .addToNamespace(ns);

  element("hud_title_text/title_frame")
    .size("100%", "50%")
    .addToNamespace(ns);

  element("hud_title_text/title_frame/title_background")
    .anchor("bottom_middle")
    .bindings(...hidePhudTitleBindings)
    .addToNamespace(ns);

  // Vanilla title path — not a LabelBuilder, so rawProp for font_scale_factor.
  element("hud_title_text/title_frame/title")
    .anchor("bottom_middle")
    .rawProp("font_scale_factor", 0.5)
    .bindings(...hidePhudTitleBindings)
    .addToNamespace(ns);

  element("hud_title_text/subtitle_frame/subtitle")
    .visible(false)
    .addToNamespace(ns);

  element("root_panel")
    .insertBack("controls", phudMain)
    .addToNamespace(ns);

  element("root_panel/chat_stack")
    .insertAfter("player_position", playerPingMain)
    .addToNamespace(ns);

  centeredHud.addToNamespace(ns);

  return ns;
});

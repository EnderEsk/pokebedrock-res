import { defineUI, panel, image, label, stackPanel, element } from "mcbe-ts-ui";

import { NS, registerSharedElements } from "./shared";
import { registerButtonElements } from "./buttons";
import { registerProgressElements } from "./progress";
import { registerActorElements } from "./actors";

const leftButtonPanel = element("left_button_panel")
  .extends(`${NS}.button_stack`)
  .fullSize()
  .layer(3)
  .variable("button", `${NS}.battle_action_button`);

const moveSelectionPanel = element("move_selection_button")
  .extends(`${NS}.button_stack`)
  .fullSize()
  .layer(3)
  .offset("55%", "20%")
  .anchor("center")
  .variable("button", `${NS}.move_selection_button`);

const gridPanel = element("grid_panel")
  .extends(`${NS}.button_stack`)
  .fullSize()
  .layer(4)
  .variable("button", `${NS}.grid_button`);

const buttonGridMiddle = image(
  "button_grid_middle",
  "textures/ui/battle/white_transparency"
)
  .rawProp("color", ["black"])
  .alpha(0)
  .layer(1)
  .rawProp("keep_ratio", true)
  .fill()
  .size("80%", "95%")
  .offset("9%", 0)
  .anchor("center")
  .controls(gridPanel);

const menuExtra = image("menu_extra", "textures/ui/battle/white_transparency")
  .color([0.137, 0.125, 0.125])
  .layer(2)
  .rawProp("keep_ratio", true)
  .fill()
  .anchor("bottom_left")
  .size("85%", "100%")
  .controls(leftButtonPanel, moveSelectionPanel, buttonGridMiddle);

const infoLabel = label("info_label", "#form_text")
  .color("default")
  .alpha(1)
  .rawProp("localize", false)
  .textAlignment("center")
  .fontScale(1)
  .size("fill", "100%")
  .anchor("center")
  .rawProp("shadow", false)
  .layer(3);

const mainButtonsHolder = stackPanel("main_buttons_holder", "horizontal")
  .size("100%", "95%")
  .anchor("bottom_left")
  .controls(menuExtra, infoLabel);

const battleMenu = image("battle_menu", "textures/ui/battle/white_transparency")
  .color([0.749, 0.168, 0.211])
  .layer(1)
  .rawProp("keep_ratio", true)
  .fill()
  .anchor("bottom_middle")
  .size("100%", "29%")
  .maxSize("613%y", "29%")
  .controls(mainButtonsHolder);

const opponentActors = element("opponent_actors")
  .extends(`${NS}.button_stack`)
  .size("25%", "100%")
  .layer(21)
  .variable("button", `${NS}.opponent_actor_details_button`);

const actorsSpacing = panel("spacing").size("50%", "100%");

const allyActors = element("ally_actors")
  .extends(`${NS}.button_stack`)
  .size("25%", "100%")
  .layer(21)
  .variable("button", `${NS}.ally_actor_details_button`);

const actorsDetailsSelection = stackPanel(
  "actors_details_selection",
  "horizontal"
)
  .size("100%", "71%")
  .maxSize("250%y", "71%")
  .offset("0%", "25%")
  .anchor("top_middle")
  .controls(opponentActors, actorsSpacing, allyActors);

const main = panel("main")
  .fullSize()
  .controls(battleMenu, actorsDetailsSelection);

const ui = defineUI(
  NS,
  (ns) => {
    registerSharedElements(ns);
    registerProgressElements(ns);
    registerButtonElements(ns);
    registerActorElements(ns);
    return ns.setMain(main);
  },
  {
    filename: "attackScreen",
    subdir: "pokemon",
  }
);

export default ui;

/** Element mounted by `server_form` via extendExternal. */
export const mount = ui.elements.main!;

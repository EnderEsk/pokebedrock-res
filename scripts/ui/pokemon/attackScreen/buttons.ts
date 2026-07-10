/**
 * Battle UI - Button Elements
 *
 * Action buttons, move buttons, and grid button elements.
 */

import {
  element,
  panel,
  image,
  label,
  extendRaw,
  collectionBinding,
  viewBinding,
  skip,
  first,
  strip,
  extend,
  type NamespaceBuilder,
  type Offset,
} from "mcbe-ts-ui";

import {
  NS,
  visibilityForId,
  formButtonsDetailsBinding,
  defaultStateVars,
  hoverStateVars,
  pressedStateVars,
  lockedStateVars,
} from "./shared";
import { createPpBarVariants } from "./progress";

const simpleButton = element("simple_button")
  .extends("common_buttons.light_text_button")
  .variable("pressed_button_name", "button.form_button_click")
  .variableDefault("size", ["100%", "100%"])
  .rawProp("size", "$size")
  .anchor("center")
  .offset(0, 0)
  .variable("border_visible", false)
  .variableDefault("hover_text_index", 53)
  .controls(
    extendRaw("default", "$button_state_panel", defaultStateVars),
    extendRaw("hover", `${NS}.button_hover_control`, hoverStateVars),
    extendRaw("pressed", "$button_state_panel", pressedStateVars),
    extendRaw("locked", "$button_state_panel", lockedStateVars)
  )
  .bindings(
    formButtonsDetailsBinding(),
    collectionBinding("#form_button_texture"),
    viewBinding("(not((%.1s * #form_button_texture) = 'f'))", "#enabled")
  );

/** Creates an action button panel */
const actionButton = (
  name: string,
  texture: string,
  offset: Offset,
  hoverIdx: number
) =>
  panel(name)
    .size("100%", "7%x")
    .offset(...offset)
    .anchor("top_left")
    .controls(
      extendRaw("form_button", `${NS}.simple_button`, {
        $default_button_texture: `textures/ui/battle/${texture}`,
        $hover_button_texture: `textures/ui/battle/${texture}_hover`,
        $pressed_button_texture: `textures/ui/battle/${texture}`,
        $locked_button_texture: `textures/ui/battle/${texture}_disabled`,
        $hover_text_index: hoverIdx,
        $size: ["25%", "80%"],
      })
    );

const bagButton = actionButton("bag_button", "menu_bag", ["-45.5%", "-13%"], 16);
const partyPokemonButton = actionButton(
  "party_pokemon_button",
  "menu_poke",
  ["-45.5%", "-26%"],
  20
);
const runButton = actionButton("run_button", "menu_run", ["-45.5%", "-38%"], 16);

const moveSelectionFrontImage = image("front_image", "#texture")
  .size("85%", "85%")
  .alpha(1)
  .anchor("center")
  .layer(16)
  .bindings(
    formButtonsDetailsBinding(),
    collectionBinding("#form_button_texture"),
    viewBinding(
      `('textures/ui/battle/moveSelectionBadges/' + ${skip(
        3,
        "#form_button_texture"
      )})`,
      "#texture"
    )
  );

const moveSelectionButton = panel("move_selection_button")
  .size("10%", "60%")
  .anchor("center")
  .layer(15)
  .controls(
    extendRaw("button", `${NS}.simple_button`, {
      $default_button_texture:
        "textures/ui/battle/moveSelectionBadges/background",
      $hover_button_texture: "textures/ui/battle/moveSelection_blank_badge",
      $pressed_button_texture: "textures/ui/battle/moveSelection_blank_badge",
      $locked_button_texture:
        "textures/ui/battle/moveSelectionBadges/background",
      $border_visible: false,
      $hover_text_index: 27,
    }),
    moveSelectionFrontImage
  )
  .bindings(...visibilityForId("battleButton:move_selection"));

const moveNameLabel = label("name", "#text")
  .fullSize()
  .offset("40%", "20%")
  .anchor("center")
  .layer(10)
  .localize()
  .color("black")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      `(${strip(
        `(('showdown.moves' + ${first(30, skip(36, "#form_button_text"))}))`
      )} + '.name')`,
      "#text"
    )
  );

const moveIcon = image("icon", "#texture")
  .layer(10)
  .size(20, 20)
  .rawProp("offset", "$icon_offset")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      strip(
        `('textures/ui/gui/attacks/' + ${first(
          8,
          skip(4, "#form_button_text")
        )})`
      ),
      "#texture"
    )
  );

const ppTextLabel = label("pp_text", "#text")
  .fullSize()
  .offset("45%", "92%")
  .anchor("center")
  .layer(11)
  .fontScale(0.8)
  .color("white")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(strip(first(7, skip(66, "#form_button_text"))), "#text")
  );

const moveButtonContainer = panel("button")
  .size("40%", "150%")
  .anchor("center")
  .controls(
    extendRaw("form_button", `${NS}.simple_button`, {
      $default_button_texture: "textures/ui/battle/moveSelection",
      $hover_button_texture: "textures/ui/battle/moveSelection_hover",
      $pressed_button_texture: "textures/ui/battle/moveSelection",
      $locked_button_texture: "textures/ui/battle/moveSelection_locked",
      $hover_text_index: 98,
    })
  );

const moveButton = panel("move_button")
  .size("100%", "7%x")
  .rawProp("offset", "$offset")
  .anchor("top_left")
  .controls(moveButtonContainer, moveNameLabel, moveIcon, ppTextLabel);

const battleActionButton = panel("battle_action_button")
  .size("100%", "100%c")
  .variable("bag_button_id", "battleButton:bag")
  .variable("pokemon_button_id", "battleButton:pokemon")
  .variable("run_button_id", "battleButton:run");

const gridButtonCheckId = element("grid_button_check_id")
  .extends(`${NS}.move_button`)
  .variableDefault("button_id", "b:1_")
  .bindings(...visibilityForId("$button_id"));

const gridButtonOffsets = [
  ["-19%", "25%"],
  ["-19%", "80%"],
  ["21.5%", "-175%"],
  ["21.5%", "-120%"],
] as const;

const gridButton = panel("grid_button").size("100%", "100%c");

/**
 * Register button elements to the namespace.
 *
 * @param ns The battle UI namespace.
 */
export function registerButtonElements(ns: NamespaceBuilder): void {
  simpleButton.addToNamespace(ns);
  const bagButtonNs = bagButton.addToNamespace(ns);
  const partyPokemonButtonNs = partyPokemonButton.addToNamespace(ns);
  const runButtonNs = runButton.addToNamespace(ns);

  battleActionButton
    .controls(
      extend("bag_button", bagButtonNs).bindings(
        ...visibilityForId("$bag_button_id")
      ),
      extend("poke_button", partyPokemonButtonNs).bindings(
        ...visibilityForId("$pokemon_button_id")
      ),
      extend("run_button", runButtonNs).bindings(
        ...visibilityForId("$run_button_id")
      )
    )
    .addToNamespace(ns);

  moveSelectionButton.addToNamespace(ns);
  moveButton
    .controls(...createPpBarVariants())
    .addToNamespace(ns);
  const gridButtonCheckIdNs = gridButtonCheckId.addToNamespace(ns);

  gridButton
    .controls(
      ...gridButtonOffsets.map((offset, index) =>
        extend(String(index + 1), gridButtonCheckIdNs)
          .variable("icon_offset", [
            `${index <= 1 ? "-" : ""}15%`,
            "-14%",
          ])
          .variable("offset", offset)
          .variable("button_id", `b:${index + 1}_`)
      )
    )
    .addToNamespace(ns);
}

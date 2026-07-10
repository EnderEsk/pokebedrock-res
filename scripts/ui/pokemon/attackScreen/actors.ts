/**
 * Battle UI - Actor Elements
 *
 * Ally and opponent actor buttons, descriptions, and related elements.
 */

import {
  element,
  panel,
  image,
  boundImage,
  label,
  stackPanel,
  collectionBinding,
  viewBinding,
  skip,
  first,
  strip,
  extend,
  extendRaw,
  type SizeValue,
  type NamespaceBuilder,
} from "mcbe-ts-ui";

import { NS, visibilityForId, formButtonsDetailsBinding } from "./shared";

/** Entity icon inside the overlay */
const entityIcon = boundImage("entity_icon")
  .size(40, 40)
  .anchor("center")
  .layer(25)
  .bindings(
    formButtonsDetailsBinding(),
    collectionBinding(
      "#form_button_texture_file_system",
      "form_buttons",
      "#texture_file_system"
    ),
    collectionBinding("#form_button_texture", "form_buttons", "#texture")
  );

/** Battle actor entity icon overlay builder */
const battleActorEntityIconOverlay = image(
  "battle_actor_entity_icon_overlay",
  "$actor_icon_overlay_texture"
)
  .size(40, 40)
  .variableDefault(
    "actor_icon_overlay_texture",
    "textures/ui/battle/pokemon_warning"
  )
  .variableDefault("actor_icon_offset", [0, 0])
  .rawProp("offset", "$actor_icon_offset")
  .controls(entityIcon);

/** Spacer panel for layout */
const spacerPanel = (height: SizeValue) =>
  panel("spacer").size("100%", height);

/** Details text label */
const detailsTextLabel = label("details_text", "#text")
  .color([0.768, 0.768, 0.768])
  .fontScale(1)
  .rawProp("offset", "$text_offset")
  .size("100%", "65%")
  .rawProp("text_alignment", "$text_alignment")
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(strip(first(58, "#form_button_text")), "#text")
  );

/** Health text label */
const healthTextLabel = label("health_text", "#text")
  .color("white")
  .fontScale(0.8)
  .offset("0%", "0%")
  .fontType("smooth")
  .textAlignment("center")
  .fullSize()
  .layer(32)
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(skip(62, "#form_button_text"), "#text")
  );

const hpBarPanel = panel("hp_bar")
  .size("100%", "21%")
  .anchor("center")
  .layer(30)
  .controls(
    healthTextLabel,
    extendRaw("health_bar", `${NS}.dynamic_progress_bar`)
  );

const battleActorDescription = stackPanel("battle_actor_description", "vertical")
  .size("100%", 40)
  .variableDefault("text_alignment", "left")
  .variableDefault("text_offset", [0, 0])
  .controls(
    spacerPanel("3%"),
    detailsTextLabel,
    spacerPanel("3%"),
    hpBarPanel
  );

const battleActorButton = element("battle_actor_button")
  .extends("common.button")
  .variable("pressed_button_name", "button.form_button_click")
  .variable("default_button_texture", "textures/ui/battle/opponent")
  .variable("hover_button_texture", "textures/ui/battle/opponent")
  .variable("pressed_button_texture", "textures/ui/battle/opponent")
  .variable("locked_button_texture", "textures/ui/battle/opponent")
  .enabled(false)
  .size(90, 42);

const spacingPanel = panel("spacing").size("5%", "100%");

const allyDetailsOverlay = stackPanel("details_overlay", "horizontal")
  .fullSize()
  .controls(
    extendRaw("actor_description", `${NS}.battle_actor_description`),
    spacingPanel,
    extendRaw("entity_icon_overlay", `${NS}.battle_actor_entity_icon_overlay`, {
      $actor_icon_overlay_texture: "textures/ui/battle/pokemon_healthy",
    })
  );

const allyActorButton = element("ally_actor_button")
  .extends(`${NS}.battle_actor_button`)
  .controls(allyDetailsOverlay);

const opponentDetailsOverlay = stackPanel("details_overlay", "horizontal")
  .fullSize()
  .controls(
    extendRaw("entity_icon_overlay", `${NS}.battle_actor_entity_icon_overlay`),
    extendRaw("actor_description", `${NS}.battle_actor_description`)
  );

const opponentActorButton = element("opponent_actor_button")
  .extends(`${NS}.battle_actor_button`)
  .controls(opponentDetailsOverlay);

const allyActorDetailsButtonCheckId = element(
  "ally_actor_details_button_check_id"
)
  .extends(`${NS}.ally_actor_button`)
  .variableDefault("button_id", "b:ally_1_")
  .bindings(...visibilityForId("$button_id"));

const opponentActorDetailsButtonCheckId = element(
  "opponent_actor_details_button_check_id"
)
  .extends(`${NS}.opponent_actor_button`)
  .variableDefault("button_id", "b:opponent_1_")
  .bindings(...visibilityForId("$button_id"));

const opponentIds = ["§0§0§1", "§0§0§2", "§0§0§3", "§0§0§4"];
const allyIds = ["§0§a§1", "§0§a§2", "§0§a§3", "§0§a§4"];

const opponentActorDetailsButton = stackPanel(
  "opponent_actor_details_button",
  "vertical"
)
  .size("100%", "100%c")
  .offset("-50%", "10%");

const allyActorDetailsButton = stackPanel("ally_actor_details_button", "vertical")
  .size("100%", "100%c")
  .offset("50%", "10%");

/**
 * Register actor elements to the namespace.
 *
 * @param ns The battle UI namespace.
 */
export function registerActorElements(ns: NamespaceBuilder): void {
  battleActorEntityIconOverlay.addToNamespace(ns);
  battleActorDescription.addToNamespace(ns);
  battleActorButton.addToNamespace(ns);
  allyActorButton.addToNamespace(ns);
  opponentActorButton.addToNamespace(ns);
  const allyActorDetailsButtonCheckIdNs =
    allyActorDetailsButtonCheckId.addToNamespace(ns);
  const opponentActorDetailsButtonCheckIdNs =
    opponentActorDetailsButtonCheckId.addToNamespace(ns);

  opponentActorDetailsButton
    .controls(
      ...opponentIds.map((id, index) =>
        extend(String(index + 1), opponentActorDetailsButtonCheckIdNs).variable(
          "button_id",
          id
        )
      )
    )
    .addToNamespace(ns);

  allyActorDetailsButton
    .controls(
      ...allyIds.map((id, index) =>
        extend(String(index + 1), allyActorDetailsButtonCheckIdNs).variable(
          "button_id",
          id
        )
      )
    )
    .addToNamespace(ns);
}

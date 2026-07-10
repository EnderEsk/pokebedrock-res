/**
 * Pokedex UI
 *
 * Pokedex interface with grid view, search, navigation, and detail view.
 */

import {
  defineUI,
  panel,
  image,
  boundImage,
  boundLabel,
  stackPanel,
  grid,
  viewBinding,
  globalBinding,
  first,
  strip,
  extendRaw,
} from "mcbe-ts-ui";

import {
  visibilityForId,
  buttonStack,
  formButtonEnabledBindings,
  formButtonTextLabelBindings,
  formButtonImageBindings,
} from "./shared";

const formButton = panel("form_button")
  .extends("common_buttons.light_text_button")
  .variable("pressed_button_name", "button.form_button_click")
  .anchor("center")
  .size("100%", "100%")
  .rawProp("offset", "$offset")
  .bindings(...formButtonEnabledBindings());

const buttonText = boundLabel("text")
  .fullSize()
  .rawProp("offset", "$text_offset")
  .layer(10)
  .rawProp("anchor_from", "$text_anchor_location")
  .rawProp("anchor_to", "$text_anchor_location")
  .fontScaleFactor(0.6)
  .color("white")
  .bindings(...formButtonTextLabelBindings());

const buttonImage = boundImage("image")
  .rawProp("size", "$image_size")
  .rawProp("offset", "$image_offset")
  .layer(11)
  .bindings(...formButtonImageBindings());

export default defineUI("pokedex", (ns) => {
  const buttonStackNs = buttonStack.addToNamespace(ns);

  const buttonNs = panel("button")
    .fullSize()
    .variableDefault("offset", ["0%", "0%"])
    .variableDefault("text_offset", ["0%", "0%"])
    .variableDefault("text_anchor_location", "center")
    .variableDefault("image_size", ["0%", "0%"])
    .variableDefault("image_offset", ["0%", "0%"])
    .controls(formButton, buttonText, buttonImage)
    .addToNamespace(ns);

  const searchButtonNs = panel("search_button")
    .extendsFrom(buttonNs)
    .variable("default_button_texture", "textures/ui/pokedex/button_search")
    .variable("hover_button_texture", "textures/ui/pokedex/button_search_hover")
    .variable("pressed_button_texture", "textures/ui/pokedex/button_search")
    .variable(
      "locked_button_texture",
      "textures/ui/pokedex/button_search_disabled"
    )
    .variable("button_image_fill", true)
    .variable("text_anchor_location", "left_middle")
    .variable("text_offset", ["3%", "20%"])
    .bindings(...visibilityForId("btn:search"))
    .addToNamespace(ns);

  const backButtonNs = panel("back_button")
    .extendsFrom(buttonNs)
    .variable("default_button_texture", "textures/ui/pokedex/button_back")
    .variable("hover_button_texture", "textures/ui/pokedex/button_back_hover")
    .variable("pressed_button_texture", "textures/ui/pokedex/button_back")
    .variable(
      "locked_button_texture",
      "textures/ui/pokedex/button_back_disabled"
    )
    .variable("button_image_fill", true)
    .bindings(...visibilityForId("btn:back"))
    .addToNamespace(ns);

  panel("previous_page_button")
    .extendsFrom(buttonNs)
    .variable(
      "default_button_texture",
      "textures/ui/pokedex/button_prev_page"
    )
    .variable(
      "hover_button_texture",
      "textures/ui/pokedex/button_prev_page_hover"
    )
    .variable(
      "pressed_button_texture",
      "textures/ui/pokedex/button_prev_page"
    )
    .variable(
      "locked_button_texture",
      "textures/ui/pokedex/button_prev_page_disabled"
    )
    .variable("button_image_fill", true)
    .bindings(...visibilityForId("btn:previous_page"))
    .addToNamespace(ns);

  panel("next_page_button")
    .extendsFrom(buttonNs)
    .variable(
      "default_button_texture",
      "textures/ui/pokedex/button_next_page"
    )
    .variable(
      "hover_button_texture",
      "textures/ui/pokedex/button_next_page_hover"
    )
    .variable(
      "pressed_button_texture",
      "textures/ui/pokedex/button_next_page"
    )
    .variable(
      "locked_button_texture",
      "textures/ui/pokedex/button_next_page_disabled"
    )
    .variable("button_image_fill", true)
    .variable("offset", ["0px", "-5%"])
    .bindings(...visibilityForId("btn:next_page"))
    .addToNamespace(ns);

  const statButtonNs = panel("stat_button")
    .extendsFrom(buttonNs)
    .variable("button_image_fill", true)
    .variable("text_anchor_location", "left_middle")
    .variable("text_offset", ["22%", "27%"])
    .variable("font_scale_factor", 0.45)
    .addToNamespace(ns);

  panel("caught_pokemon_button")
    .extendsFrom(statButtonNs)
    .variable("default_button_texture", "textures/ui/pokedex/button_caught")
    .variable(
      "hover_button_texture",
      "textures/ui/pokedex/button_caught_hover"
    )
    .variable("pressed_button_texture", "textures/ui/pokedex/button_caught")
    .variable(
      "locked_button_texture",
      "textures/ui/pokedex/button_caught_disabled"
    )
    .bindings(...visibilityForId("btn:caught_pokemon"))
    .addToNamespace(ns);

  panel("seen_pokemon_button")
    .extendsFrom(statButtonNs)
    .variable("default_button_texture", "textures/ui/pokedex/button_seen")
    .variable("hover_button_texture", "textures/ui/pokedex/button_seen_hover")
    .variable("pressed_button_texture", "textures/ui/pokedex/button_seen")
    .variable(
      "locked_button_texture",
      "textures/ui/pokedex/button_seen_disabled"
    )
    .bindings(...visibilityForId("btn:seen_pokemon"))
    .addToNamespace(ns);

  panel("completion_button")
    .extendsFrom(statButtonNs)
    .variable("default_button_texture", "textures/ui/pokedex/button_completion")
    .variable(
      "hover_button_texture",
      "textures/ui/pokedex/button_completion_hover"
    )
    .variable(
      "pressed_button_texture",
      "textures/ui/pokedex/button_completion"
    )
    .variable(
      "locked_button_texture",
      "textures/ui/pokedex/button_completion_disabled"
    )
    .bindings(...visibilityForId("btn:completion"))
    .addToNamespace(ns);

  panel("icon")
    .extendsFrom(buttonNs)
    .variable(
      "default_button_texture",
      "textures/ui/battle/white_transparency"
    )
    .variable("hover_button_texture", "textures/ui/battle/white_transparency")
    .variable(
      "pressed_button_texture",
      "textures/ui/battle/white_transparency"
    )
    .variable("locked_button_texture", "textures/ui/battle/white_transparency")
    .variable("image_size", ["100%", "100%"])
    .variable("button_image_fill", true)
    .bindings(...visibilityForId("btn:icon"))
    .addToNamespace(ns);

  // Detail view (registered for form routing; main shows grid)
  const pokemonName = boundLabel("pokemon_name")
    .size(165, 8)
    .fontScaleFactor(0.6)
    .color("white")
    .anchor("top_left")
    .bindings(
      globalBinding("#form_text"),
      viewBinding(strip(first(40, "#form_text")), "#text")
    );

  const spawnLocation = boundLabel("spawn_location")
    .size(165, 6)
    .fontScaleFactor(0.6)
    .color("white")
    .anchor("top_left")
    .bindings(
      globalBinding("#form_text"),
      viewBinding(
        strip(`(${first(80, "#form_text")} - ${first(40, "#form_text")})`),
        "#text"
      )
    );

  const detailsText = boundLabel("text")
    .size(110, 55)
    .fontScaleFactor(0.6)
    .color("white")
    .anchor("top_left")
    .bindings(
      globalBinding("#form_text"),
      viewBinding(
        strip(`(${first(400, "#form_text")} - ${first(80, "#form_text")})`),
        "#text"
      )
    );

  const detailsRow = stackPanel("pokemon_details", "horizontal")
    .size(165, 54)
    .controls(
      detailsText,
      panel("icon")
        .extendsFrom(buttonStackNs)
        .size(55, 55)
        .variable("offset", [0, 2])
        .layer(4)
        .variable("button", "pokedex.icon")
    );

  const detailsStack = stackPanel("details", "vertical")
    .fullSize()
    .offset(35, 133)
    .controls(pokemonName, spawnLocation, detailsRow);

  const topDetails = stackPanel("top_details", "horizontal")
    .fullSize()
    .offset(32, 116)
    .controls(
      panel("back_button")
        .extendsFrom(buttonStackNs)
        .size(22, 12)
        .layer(4)
        .variable("button", backButtonNs.getQualifiedName()),
      panel("spacer").size(1, 12),
      panel("search_button")
        .extendsFrom(buttonStackNs)
        .size(146, 12)
        .layer(4)
        .variable("button", searchButtonNs.getQualifiedName())
    );

  const detailsWindow = image(
    "pokemon_details_window",
    "textures/ui/pokedex/details_background"
  )
    .size(233, 299)
    .anchor("center")
    .layer(1)
    .controls(
      extendRaw("close_button", "common.light_close_button", {
        $close_button_offset: [-10, 111],
      }),
      topDetails,
      detailsStack
    );

  panel("pokemon_details")
    .fullSize()
    .controls(
      image("background_fade", "textures/ui/Black")
        .alpha(0.5)
        .size("300%", "300%")
        .anchor("center")
        .layer(0),
      detailsWindow
    )
    .addToNamespace(ns);

  const pageButtons = stackPanel("page_management_buttons", "vertical")
    .fullSize()
    .offset(196, 144)
    .controls(
      panel("page_management")
        .extendsFrom(buttonStackNs)
        .size(11, 26)
        .layer(4)
        .variable("button", "pokedex.previous_page_button"),
      panel("page_management")
        .extendsFrom(buttonStackNs)
        .size(11, 26)
        .layer(4)
        .variable("button", "pokedex.next_page_button")
    );

  const infoButtons = stackPanel("pokedex_info_buttons", "horizontal")
    .fullSize()
    .offset(32, 207)
    .controls(
      panel("caught_pokemon")
        .extendsFrom(buttonStackNs)
        .size(54, 17)
        .layer(4)
        .variable("button", "pokedex.caught_pokemon_button"),
      panel("spacer").size(0.5, 17),
      panel("seen_pokemon")
        .extendsFrom(buttonStackNs)
        .size(54, 17)
        .layer(4)
        .variable("button", "pokedex.seen_pokemon_button"),
      panel("spacer_2").size(0.5, 17),
      panel("completion")
        .extendsFrom(buttonStackNs)
        .size(54, 17)
        .layer(4)
        .variable("button", "pokedex.completion_button")
    );

  const mainGridWindow = image(
    "main_grid_window",
    "textures/ui/pokedex/grid_background"
  )
    .size(233, 299)
    .anchor("center")
    .layer(1)
    .controls(
      extendRaw("close_button", "common.light_close_button", {
        $close_button_offset: [-10, 111],
      }),
      panel("search_button")
        .extendsFrom(buttonStackNs)
        .size(163, 12)
        .offset(32, 116)
        .layer(4)
        .variable("button", "pokedex.search_button"),
      pageButtons,
      infoButtons,
      grid("small_chest_grid")
        .gridDimensions(9, 4)
        .size(162, 72)
        .offset(34, 132)
        .anchor("top_left")
        .gridItemTemplate("chest_ui.chest_item")
        .collectionName("form_buttons")
        .layer(1)
    );

  const backgroundFade = image("background_fade", "textures/ui/Black")
    .alpha(0.5)
    .size("300%", "300%")
    .anchor("center")
    .layer(0);

  const [, finalNs] = ns.add(
    panel("main_grid").fullSize().controls(backgroundFade, mainGridWindow)
  );
  return finalNs;
});

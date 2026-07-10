/**
 * PC Storage UI
 *
 * Pokemon PC box storage interface with navigation and action buttons.
 */

import {
  defineUI,
  panel,
  image,
  boundImage,
  stackPanel,
  viewBinding,
  globalBinding,
  strip,
  skip,
  first,
  boundLabel,
  grid,
  extendRaw,
} from "mcbe-ts-ui";

import {
  visibilityForId,
  buttonStack,
  formButtonEnabledBindings,
  formButtonTextLabelBindings,
  formButtonImageBindings,
  simpleButtonTextures,
} from "./shared";

const NAMESPACE = "pc";

// Base button template
const formButton = panel("form_button")
  .extends("common_buttons.light_text_button")
  .fullSize()
  .anchor("center")
  .variable("pressed_button_name", "button.form_button_click")
  .rawProp("offset", "$offset")
  .bindings(...formButtonEnabledBindings());

const buttonText = boundLabel("text")
  .fullSize()
  .layer(10)
  .rawProp("offset", "$text_offset")
  .rawProp("anchor_from", "$text_anchor_location")
  .rawProp("anchor_to", "$text_anchor_location")
  .rawProp("font_scale_factor", "$text_font_scale_factor")
  .rawProp("text_alignment", "$text_alignment")
  .rawProp("shadow", "$text_shadow")
  .color("white")
  .bindings(...formButtonTextLabelBindings());

const buttonImage = boundImage("image")
  .rawProp("size", "$image_size")
  .rawProp("offset", "$image_offset")
  .layer(11)
  .bindings(...formButtonImageBindings());

const actionButtonTextures = simpleButtonTextures(
  "textures/ui/pc/buttons",
  "action_button"
);

const filterButtonTextures = simpleButtonTextures(
  "textures/ui/pc/buttons",
  "filter_button"
);

const searchButtonTextures = simpleButtonTextures(
  "textures/ui/pc/buttons",
  "search_button"
);

const settingsButtonTextures = simpleButtonTextures(
  "textures/ui/pc/buttons",
  "settings_button"
);

const leftArrowTextures = simpleButtonTextures(
  "textures/ui/pc/buttons",
  "left_arrow"
);

const rightArrowTextures = simpleButtonTextures(
  "textures/ui/pc/buttons",
  "right_arrow"
);

// TODO: Make textures type safe.
const iconBoxTexture = "textures/ui/pc/icon_box";

const button = panel("button")
  .fullSize()
  .variableDefault("offset", ["0%", "0%"])
  .variableDefault("text_offset", ["0%", "0%"])
  .variableDefault("text_anchor_location", "center")
  .variableDefault("text_alignment", "left")
  .variableDefault("text_font_scale_factor", 0.6)
  .variableDefault("text_shadow", false)
  .variableDefault("image_size", ["0%", "0%"])
  .variableDefault("image_offset", ["0%", "0%"])
  .controls(formButton, buttonText, buttonImage);

const leftArrowButton = panel("left_arrow_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", leftArrowTextures.default)
  .variable("hover_button_texture", leftArrowTextures.hover)
  .variable("pressed_button_texture", leftArrowTextures.pressed)
  .variable("locked_button_texture", leftArrowTextures.locked)
  .variable("button_image_fill", false)
  .variable("border_visible", false)
  .bindings(...visibilityForId("btn:left_arrow"));

const rightArrowButton = panel("right_arrow_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", rightArrowTextures.default)
  .variable("hover_button_texture", rightArrowTextures.hover)
  .variable("pressed_button_texture", rightArrowTextures.pressed)
  .variable("locked_button_texture", rightArrowTextures.locked)
  .variable("button_image_fill", false)
  .variable("border_visible", false)
  .bindings(...visibilityForId("btn:right_arrow"));

const filterButton = panel("filter_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", filterButtonTextures.default)
  .variable("hover_button_texture", filterButtonTextures.hover)
  .variable("pressed_button_texture", filterButtonTextures.pressed)
  .variable("locked_button_texture", filterButtonTextures.locked)
  .variable("button_image_fill", false)
  .variable("border_visible", false)
  .bindings(...visibilityForId("btn:filter_button"));

const searchButton = panel("search_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", searchButtonTextures.default)
  .variable("hover_button_texture", searchButtonTextures.hover)
  .variable("pressed_button_texture", searchButtonTextures.pressed)
  .variable("locked_button_texture", searchButtonTextures.locked)
  .variable("button_image_fill", false)
  .variable("border_visible", false)
  .bindings(...visibilityForId("btn:search_button"));

const settingsButton = panel("settings_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", settingsButtonTextures.default)
  .variable("hover_button_texture", settingsButtonTextures.hover)
  .variable("pressed_button_texture", settingsButtonTextures.pressed)
  .variable("locked_button_texture", settingsButtonTextures.locked)
  .variable("button_image_fill", false)
  .variable("border_visible", false)
  .bindings(...visibilityForId("btn:settings_button"));

const trashButton = panel("trash_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", "textures/ui/icon_trash")
  .variable("hover_button_texture", "textures/ui/icon_trash")
  .variable("pressed_button_texture", "textures/ui/icon_trash")
  .variable("locked_button_texture", "textures/ui/icon_trash")
  .variable("button_image_fill", false)
  .variable("border_visible", false)
  .variable("text_alignment", "center")
  .variable("text_font_scale_factor", 1)
  .variable("text_offset", ["6px", "-1px"])
  .variable("text_shadow", true)
  .bindings(...visibilityForId("btn:trash_button"));

const iconButton = panel("icon_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", iconBoxTexture)
  .variable("hover_button_texture", iconBoxTexture)
  .variable("pressed_button_texture", iconBoxTexture)
  .variable("locked_button_texture", iconBoxTexture)
  .variable("image_size", ["100%", "100%"])
  .variable("button_image_fill", true)
  .variable("border_visible", false)
  .bindings(...visibilityForId("btn:icon"));

const actionButtonTemplate = panel("action_button")
  .extends(`${NAMESPACE}.button`)
  .variable("default_button_texture", actionButtonTextures.default)
  .variable("hover_button_texture", actionButtonTextures.hover)
  .variable("pressed_button_texture", actionButtonTextures.pressed)
  .variable("locked_button_texture", actionButtonTextures.locked)
  .variable("button_image_fill", false)
  .variable("border_visible", false)
  .variable("text_alignment", "center")
  .variable("text_font_scale_factor", 0.8)
  .variable("text_offset", ["0px", "5px"])
  .bindings(...visibilityForId("btn:action_button"));

// Container slots with grid
const smallChestGrid = grid("small_chest_grid")
  .gridDimensions(6, 6)
  .size(108, 118)
  .offset(5, 5)
  .anchor("top_left")
  .gridItemTemplate("chest_ui.chest_item")
  .collectionName("form_buttons")
  .layer(1);

const partySlots = image("party_slots", "textures/ui/pc/party_slots").size(
  "100%",
  26
);

const titleLabel = boundLabel("text", "text")
  .textAlignment("center")
  .fontScaleFactor(0.95)
  .bindings(
    globalBinding("#title_text"),
    viewBinding(strip(first(22, skip(22, "#title_text"))), "#text")
  );

const title = panel("title")
  .size(84, "100%")
  .offset(0, 7)
  .layer(3)
  .controls(titleLabel);

// Search field label in details bar
const searchFieldText = boundLabel("text")
  .offset(-8, 0.5)
  .textAlignment("left")
  .fontScaleFactor(0.85)
  .bindings(
    globalBinding("#title_text"),
    viewBinding(strip(first(22, "#title_text")), "#text")
  );

const searchField = panel("search_field")
  .size(66, "100%")
  .offset(0, 1)
  .layer(3)
  .controls(searchFieldText);

// Left content box with close button, header and body text
const leftContentBoxHeader = boundLabel("header_text")
  .size(64, 8)
  .fontScaleFactor(0.7)
  .color("white")
  .offset(3, 0)
  .anchor("top_left")
  .textAlignment("center")
  .bindings(
    globalBinding("#form_text"),
    viewBinding(strip(first(40, "#form_text")), "#text")
  );

const leftContentBoxBody = boundLabel("body_text")
  .size(64, 95)
  .fontScaleFactor(0.6)
  .color("white")
  .anchor("top_left")
  .bindings(
    globalBinding("#form_text"),
    viewBinding(strip(skip(40, "#form_text")), "#text")
  );

const closeButton = extendRaw("close_button", "common.light_close_button", {
  $close_button_offset: [3, -3],
});

const leftContentStack = stackPanel("content_stack", "vertical")
  .fullSize()
  .offset(5, 4)
  .controls(leftContentBoxHeader, leftContentBoxBody);

const leftContentBox = image("left_content_box", "textures/ui/pc/content_box")
  .size(73, 115)
  .controls(closeButton, leftContentStack, {
    "trash_button@pc.button_stack": {
      size: [18, 18],
      layer: 5,
      anchor_from: "bottom_right",
      anchor_to: "bottom_right",
      offset: [2, 48],
      $button: "pc.trash_button",
    },
  });

// Details bar buttons
const filterButtonStack = panel("filter_button")
  .extends(`${NAMESPACE}.button_stack`)
  .size(14, "100%")
  .layer(3)
  .anchor("center")
  .variable("button", `${NAMESPACE}.filter_button`);

const searchButtonStack = panel("search_button")
  .extends(`${NAMESPACE}.button_stack`)
  .size(14, "100%")
  .layer(3)
  .anchor("center")
  .variable("button", `${NAMESPACE}.search_button`);

const settingsButtonStack = panel("settings_button")
  .extends(`${NAMESPACE}.button_stack`)
  .size(14, "100%")
  .offset(0, 3)
  .layer(3)
  .anchor("center")
  .variable("button", `${NAMESPACE}.settings_button`);

const detailsBarContent = stackPanel("box_details", "horizontal")
  .fullSize()
  .controls(
    panel("start_padding").size(5, "100%"),
    filterButtonStack,
    searchButtonStack,
    searchField,
    settingsButtonStack,
    panel("end_padding").size(5, "100%")
  );

const detailsBar = image("filter_box", "textures/ui/pc/filter_box")
  .size("100%", 17)
  .controls(detailsBarContent);

// Title box with navigation arrows
const leftButton = panel("left_button")
  .extends(`${NAMESPACE}.button_stack`)
  .size(11, "100%")
  .layer(3)
  .anchor("center")
  .variable("button", `${NAMESPACE}.left_arrow_button`);

const rightButton = panel("right_button")
  .extends(`${NAMESPACE}.button_stack`)
  .size(11, "100%")
  .layer(3)
  .anchor("center")
  .variable("button", `${NAMESPACE}.right_arrow_button`);

const titleBoxContent = stackPanel("box_details", "horizontal")
  .fullSize()
  .controls(
    panel("start_padding").size(5, "100%"),
    leftButton,
    title,
    rightButton,
    panel("end_padding").size(5, "100%")
  );

const titleBox = image("title_box", "textures/ui/pc/title_box")
  .size("100%", 17)
  .controls(titleBoxContent);

// Container slots with dynamic background texture
const containerSlotsBackground = boundImage("container_slots")
  .texture("#texture")
  .size("100%", 105)
  .controls(smallChestGrid)
  .bindings(
    globalBinding("#title_text"),
    viewBinding(
      "(('textures/ui/pc/backgrounds/' + (#title_text - (%.44s * #title_text))) - '_')",
      "#texture"
    )
  );

// Center grid stack
const centerGrid = stackPanel("center_grid", "vertical")
  .size(116, "100%c")
  .controls(
    detailsBar,
    panel("spacer1").size("100%", 1),
    titleBox,
    panel("spacer2").size("100%", 1),
    containerSlotsBackground,
    panel("spacer3").size("100%", 8),
    partySlots
  );

// Right content (icon and action)
const iconBox = panel("icon_box")
  .extends(`${NAMESPACE}.button_stack`)
  .size("100%", 70)
  .layer(3)
  .anchor("center")
  .variable("button", `${NAMESPACE}.icon_button`);

const actionButtonBox = panel("action_button")
  .extends(`${NAMESPACE}.button_stack`)
  .size("100%", 18)
  .layer(3)
  .anchor("center")
  .variable("button", `${NAMESPACE}.action_button`);

const rightContent = stackPanel("right_content", "vertical")
  .size(71, "100%c")
  .controls(iconBox, panel("spacer").size("100%", 0.5), actionButtonBox);

const backgroundFade = image("background_fade", "textures/ui/Black")
  .alpha(0.5)
  .size("300%", "300%")
  .anchor("center")
  .layer(0);

const pcLayout = stackPanel("pc_layout", "horizontal")
  .size("100%c", "100%c")
  .anchor("center")
  .offset(0, 90)
  .layer(1)
  .controls(
    leftContentBox,
    panel("spacer1").size(2, "100%c"),
    centerGrid,
    panel("spacer2").size(1, "100%c"),
    rightContent
  );

const main = panel("main")
  .fullSize()
  .controls(backgroundFade, pcLayout);

export default defineUI(NAMESPACE, (ns) => {
  buttonStack.addToNamespace(ns);
  button.addToNamespace(ns);
  leftArrowButton.addToNamespace(ns);
  rightArrowButton.addToNamespace(ns);
  filterButton.addToNamespace(ns);
  searchButton.addToNamespace(ns);
  settingsButton.addToNamespace(ns);
  trashButton.addToNamespace(ns);
  iconButton.addToNamespace(ns);
  actionButtonTemplate.addToNamespace(ns);

  return ns.setMain(main);
});

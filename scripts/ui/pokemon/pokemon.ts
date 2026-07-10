/**
 * Pokemon Starter Selection UI
 *
 * Pokemon starter picker interface.
 */

import {
  defineUI,
  image,
  label,
  panel,
  stackPanel,
  grid,
  custom,
  boundImage,
  element,
  ImageBuilder,
  contains,
  equals,
  collectionBinding,
  factoryBindings,
  viewBinding,
  siblingViewBinding,
  collectionDetailsBinding,
  imageTextureBindings,
  globalBinding,
  extendRaw,
  ref,
} from "mcbe-ts-ui";

const NAMESPACE = "pokemon";

// Button action template (hover overlay + tooltip)
const buttonAction = stackPanel("button_action", "vertical")
  .anchor("top_left")
  .size("100%", "100%")
  .variableDefault("color", "default")
  .controls(
    new ImageBuilder("entry_description")
      .size("100%", "100%")
      .layer(2)
      .variableDefault("alpha", 0)
      .rawProp("variables", [
        { requires: "($state = 'hover')", $alpha: 0.3, $color: "black" },
      ])
      .rawProp("alpha", "$alpha")
      .ignoreRatio()
      .controls(
        boundImage("entry_description_label")
          .color("$color")
          .bindings(...imageTextureBindings()),
        custom("hover_text")
          .renderer("hover_text_renderer")
          .allowClipping(false)
          .layer(30)
          .size("100%", "100%")
          .variableDefault("visible", false)
          .rawProp("variables", [
            { requires: "($state = 'hover')", $visible: true },
          ])
          .visible("$visible")
          .bindings(
            collectionBinding("#form_button_text"),
            collectionDetailsBinding(),
            viewBinding("#form_button_text", "#hover_text")
          )
      )
  );

const buttonStack = stackPanel("button_stack", "vertical")
  .size("100%", "100%c")
  .anchor("top_left")
  .variableDefault("button", "default_form.button")
  .factory("buttons", "$button")
  .collectionName("form_buttons")
  .bindings(
    ...factoryBindings(),
    viewBinding(contains("#title_text", "§s"), "#visible")
  );

const pokemonText = label("pokemon_text", "#title_text")
  .fontType("MinecraftTen")
  .textAlignment("left")
  .linePadding(2)
  .fontScaleFactor(1)
  .size("100%", "default")
  .anchor("top_middle")
  .offset("42%", -10)
  .layer(5)
  .shadow()
  .bindings(globalBinding("#title_text"))
  .controls(
    label("data", "#form_text")
      .fontType("default")
      .textAlignment("left")
      .linePadding(2)
      .color("white")
      .fontScaleFactor(1)
      .anchor("left_middle")
      .size("40%", "default")
      .offset("20%", 50)
      .layer(5)
      .shadow()
  );

const button = panel("button")
  .size("15%", 30)
  .controls(
    element("button")
      .extends("common.button")
      .size("45%", "100%")
      .anchor("top_middle")
      .layer(1)
      .variable("pressed_button_name", "button.form_button_click")
      .controls(
        extendRaw("default", `${NAMESPACE}.button_action`, { $state: "default" }),
        extendRaw("hover", `${NAMESPACE}.button_action`, { $state: "hover" })
      )
      .bindings(
        collectionDetailsBinding(),
        collectionBinding("#form_button_text"),
        viewBinding(
          "(not ((#form_button_text = '') or (#form_button_text = 'loading')))",
          "#visible"
        )
      )
  )
  .bindings(collectionBinding("#form_button_text"));

const icon = panel("icon")
  .size("100%", "8%x")
  .controls(
    element("form_button")
      .extends("common.button")
      .variableDefault("default_state", false)
      .variableDefault("hover_state", false)
      .variable("pressed_button_name", "button.form_button_click")
      .size("100%", "100%")
      .anchor("top_middle")
      .offset(0, "-300%")
      .controls(
        boundImage("image")
          .anchor("top_middle")
          .layer(5)
          .size("400%y", "400%")
          .bindings(...imageTextureBindings())
      )
      .bindings(collectionDetailsBinding())
  );

const backButton = panel("back_button")
  .size("100%", "8%x")
  .controls(
    element("form_button")
      .extends("common.button")
      .variable("pressed_button_name", "button.form_button_click")
      .variableDefault("default_state", false)
      .variableDefault("hover_state", false)
      .size("25%", "75%")
      .anchor("left_middle")
      .offset("-40%", "25%")
      .controls(
        image("arrow", "textures/ui/chevron_left").size("50%", "100%x").layer(2),
        image("hover", "textures/ui/chevron_left")
          .size("50%", "100%x")
          .layer(2)
          .color("black")
      )
      .bindings(collectionDetailsBinding())
  );

const acceptLabel = () =>
  label("text", "Start adventure !")
    .fontType("MinecraftTen")
    .rawProp("localize", false)
    .color("white")
    .textAlignment("center")
    .fontScaleFactor(1)
    .size("100%", "100%")
    .anchor("center")
    .offset(0, 5)
    .layer(10000);

const acceptButton = panel("accept_button")
  .size("100%", "8%x")
  .controls(
    element("form_button")
      .extends("common.button")
      .variable("pressed_button_name", "button.form_button_click")
      .variableDefault("default_state", false)
      .variableDefault("hover_state", false)
      .size("25%", "75%")
      .anchor("left_middle")
      .offset(0, "200%")
      .controls(
        image("button", "textures/ui/pokemon/background_default")
          .size("100%", "100%")
          .layer(2)
          .controls(acceptLabel()),
        image("hover", "textures/ui/pokemon/background_hover")
          .size("100%", "100%")
          .layer(2)
          .controls(acceptLabel())
      )
      .bindings(collectionDetailsBinding())
  );

const selectButton = panel("select_button")
  .size("100%", "100%c")
  .controls(
    ref(`back_button@${NAMESPACE}.back_button`, {
      bindings: [
        siblingViewBinding("image", equals("#texture", "back"), "#visible"),
      ],
    }),
    ref(`accept_button@${NAMESPACE}.accept_button`, {
      bindings: [
        siblingViewBinding(
          "image",
          equals("#texture", "accept"),
          "#visible"
        ),
      ],
    }),
    ref(`pokemon_icon@${NAMESPACE}.icon`, {
      bindings: [
        collectionBinding("#form_button_text"),
        viewBinding(equals("#form_button_text", "§i§m§g"), "#visible"),
      ],
    })
  );

const pickerPanelGrid = grid("picker_panel_grid")
  .size("100%", "100%c")
  .offset(0, 10)
  .anchor("top_middle")
  .gridItemTemplate(`${NAMESPACE}.button`)
  .gridRescaling("horizontal")
  .collectionName("form_buttons")
  .bindings(
    {
      binding_name: "#form_button_length",
      binding_name_override: "#maximum_grid_items",
    },
    viewBinding(contains("#title_text", "§1"), "#visible")
  );

const pokemonPanelGrid = panel("pokemon_panel_grid")
  .extends(`${NAMESPACE}.button_stack`)
  .size("98%", "100%c")
  .variable("button", `${NAMESPACE}.select_button`);

const commonPanel = panel("common_panel")
  .anchor("center")
  .offset(0, 5)
  .size("100% - 5px", "100%c")
  .controls(
    ref(`picker_panel_grid@${NAMESPACE}.picker_panel_grid`),
    ref(`pokemon_panel_grid@${NAMESPACE}.pokemon_panel_grid`),
    ref(`pokemon_text@${NAMESPACE}.pokemon_text`)
  );

const mainPanel = image("main_panel", "textures/ui/pokemon/background")
  .rawProp("keep_ratio", true)
  .layer(1)
  .fullSize()
  .fill()
  .anchor("center")
  .controls(
    panel("text_common")
      .anchor("top_middle")
      .size("60%", "30%")
      .offset(0, "15%")
      .layer(2)
      .controls(
        label("hello", "Welcome to PokéBedrock !")
          .fontType("default")
          .rawProp("localize", false)
          .color("white")
          .textAlignment("center")
          .fontScaleFactor(1)
          .anchor("top_middle")
          .size("90%", 20)
          .offset(0, 0),
        label("pick", "Now, please pick your desired starter Pokémon !")
          .fontType("default")
          .rawProp("localize", false)
          .color("white")
          .textAlignment("center")
          .fontScaleFactor(1)
          .anchor("top_middle")
          .size("90%", 20)
          .offset(0, 10)
      ),
    image("button_panel", "textures/ui/pokemon/background")
      .color("black")
      .anchor("bottom_middle")
      .size("80%", "60%")
      .alpha(0)
      .offset(0, 0)
      .controls(ref(`common_panel@${NAMESPACE}.common_panel`))
  );

export default defineUI(NAMESPACE, (ns) => {
  buttonStack.addToNamespace(ns);
  pokemonText.addToNamespace(ns);
  buttonAction.addToNamespace(ns);
  button.addToNamespace(ns);
  icon.addToNamespace(ns);
  backButton.addToNamespace(ns);
  acceptButton.addToNamespace(ns);
  selectButton.addToNamespace(ns);
  pickerPanelGrid.addToNamespace(ns);
  pokemonPanelGrid.addToNamespace(ns);
  commonPanel.addToNamespace(ns);

  return ns.setMain(mainPanel);
});

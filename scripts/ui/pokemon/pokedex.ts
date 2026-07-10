/**
 * Pokedex UI
 *
 * Pokedex interface with grid view, search, navigation, and detail view.
 */

import {
  defineUI,
  viewBinding,
  globalBinding,
  first,
  strip,
  image,
  panel,
} from "mcbe-ts-ui";

import {
  visibilityForId,
  buttonStack,
  formButtonEnabledBindings,
  formButtonTextLabelBindings,
  formButtonImageBindings,
  buttonTextureProps,
} from "./shared";

export default defineUI("pokedex", (ns) => {
  // Button stack factory
  buttonStack.addToNamespace(ns);

  // Base button template
  ns.addRaw("button", {
    type: "panel",
    size: ["100%", "100%"],
    "$offset|default": ["0%", "0%"],
    "$text_offset|default": ["0%", "0%"],
    "$text_anchor_location|default": "center",
    "$image_size|default": ["0%", "0%"],
    "$image_offset|default": ["0%", "0%"],
    controls: [
      {
        "form_button@common_buttons.light_text_button": {
          $pressed_button_name: "button.form_button_click",
          anchor_from: "center",
          anchor_to: "center",
          size: ["100%", "100%"],
          offset: "$offset",
          bindings: formButtonEnabledBindings(),
        },
      },
      {
        text: {
          type: "label",
          size: ["100%", "100%"],
          offset: "$text_offset",
          layer: 10,
          anchor_from: "$text_anchor_location",
          anchor_to: "$text_anchor_location",
          text: "#text",
          font_scale_factor: 0.6,
          color: "white",
          bindings: formButtonTextLabelBindings(),
        },
      },
      {
        image: {
          type: "image",
          size: "$image_size",
          offset: "$image_offset",
          layer: 11,
          bindings: formButtonImageBindings(),
        },
      },
    ],
  });

  // Button variants
  ns.addRaw("search_button@pokedex.button", {
    ...buttonTextureProps({
      default: "textures/ui/pokedex/button_search",
      hover: "textures/ui/pokedex/button_search_hover",
      pressed: "textures/ui/pokedex/button_search",
      locked: "textures/ui/pokedex/button_search_disabled",
    }),
    $button_image_fill: true,
    $text_anchor_location: "left_middle",
    $text_offset: ["3%", "20%"],
    bindings: visibilityForId("btn:search"),
  });

  ns.addRaw("back_button@pokedex.button", {
    ...buttonTextureProps({
      default: "textures/ui/pokedex/button_back",
      hover: "textures/ui/pokedex/button_back_hover",
      pressed: "textures/ui/pokedex/button_back",
      locked: "textures/ui/pokedex/button_back_disabled",
    }),
    $button_image_fill: true,
    bindings: visibilityForId("btn:back"),
  });

  ns.addRaw("previous_page_button@pokedex.button", {
    ...buttonTextureProps({
      default: "textures/ui/pokedex/button_prev_page",
      hover: "textures/ui/pokedex/button_prev_page_hover",
      pressed: "textures/ui/pokedex/button_prev_page",
      locked: "textures/ui/pokedex/button_prev_page_disabled",
    }),
    $button_image_fill: true,
    bindings: visibilityForId("btn:previous_page"),
  });

  ns.addRaw("next_page_button@pokedex.button", {
    ...buttonTextureProps({
      default: "textures/ui/pokedex/button_next_page",
      hover: "textures/ui/pokedex/button_next_page_hover",
      pressed: "textures/ui/pokedex/button_next_page",
      locked: "textures/ui/pokedex/button_next_page_disabled",
    }),
    $button_image_fill: true,
    $offset: ["0px", "-5%"],
    bindings: visibilityForId("btn:next_page"),
  });

  ns.addRaw("stat_button@pokedex.button", {
    $button_image_fill: true,
    $text_anchor_location: "left_middle",
    $text_offset: ["22%", "27%"],
    $font_scale_factor: 0.45,
  });

  ns.addRaw("caught_pokemon_button@pokedex.stat_button", {
    ...buttonTextureProps({
      default: "textures/ui/pokedex/button_caught",
      hover: "textures/ui/pokedex/button_caught_hover",
      pressed: "textures/ui/pokedex/button_caught",
      locked: "textures/ui/pokedex/button_caught_disabled",
    }),
    bindings: visibilityForId("btn:caught_pokemon"),
  });

  ns.addRaw("seen_pokemon_button@pokedex.stat_button", {
    ...buttonTextureProps({
      default: "textures/ui/pokedex/button_seen",
      hover: "textures/ui/pokedex/button_seen_hover",
      pressed: "textures/ui/pokedex/button_seen",
      locked: "textures/ui/pokedex/button_seen_disabled",
    }),
    bindings: visibilityForId("btn:seen_pokemon"),
  });

  ns.addRaw("completion_button@pokedex.stat_button", {
    ...buttonTextureProps({
      default: "textures/ui/pokedex/button_completion",
      hover: "textures/ui/pokedex/button_completion_hover",
      pressed: "textures/ui/pokedex/button_completion",
      locked: "textures/ui/pokedex/button_completion_disabled",
    }),
    bindings: visibilityForId("btn:completion"),
  });

  // Icon button (transparent)
  ns.addRaw("icon@pokedex.button", {
    $default_button_texture: "textures/ui/battle/white_transparency",
    $hover_button_texture: "textures/ui/battle/white_transparency",
    $pressed_button_texture: "textures/ui/battle/white_transparency",
    $locked_button_texture: "textures/ui/battle/white_transparency",
    $image_size: ["100%", "100%"],
    $button_image_fill: true,
    bindings: visibilityForId("btn:icon"),
  });

  // Pokemon details view
  ns.addRaw("pokemon_details", {
    type: "panel",
    size: ["100%", "100%"],
    controls: [
      {
        background_fade: {
          type: "image",
          texture: "textures/ui/Black",
          alpha: 0.5,
          size: ["300%", "300%"],
          anchor_from: "center",
          anchor_to: "center",
          layer: 0,
        },
      },
      {
        pokemon_details_window: {
    type: "image",
    texture: "textures/ui/pokedex/details_background",
    size: [233, 299],
    anchor_from: "center",
    anchor_to: "center",
    layer: 1,
    controls: [
      {
        "close_button@common.light_close_button": {
          $close_button_offset: [-10, 111],
        },
      },
      {
        top_details: {
          type: "stack_panel",
          orientation: "horizontal",
          size: ["100%", "100%"],
          offset: [32, 116],
          controls: [
            {
              "back_button@pokedex.button_stack": {
                size: [22, 12],
                layer: 4,
                $button: "pokedex.back_button",
              },
            },
            { spacer: { type: "panel", size: [1, 12] } },
            {
              "search_button@pokedex.button_stack": {
                size: [146, 12],
                layer: 4,
                $button: "pokedex.search_button",
              },
            },
          ],
        },
      },
      {
        details: {
          type: "stack_panel",
          orientation: "vertical",
          size: ["100%", "100%"],
          offset: [35, 133],
          controls: [
            {
              pokemon_name: {
                type: "label",
                size: [165, 8],
                font_scale_factor: 0.6,
                color: "white",
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: "#text",
                bindings: [
                  globalBinding("#form_text"),
                  viewBinding(strip(first(40, "#form_text")), "#text"),
                ],
              },
            },
            {
              spawn_location: {
                type: "label",
                size: [165, 6],
                font_scale_factor: 0.6,
                color: "white",
                anchor_from: "top_left",
                anchor_to: "top_left",
                text: "#text",
                bindings: [
                  globalBinding("#form_text"),
                  viewBinding(
                    strip(
                      `(${first(80, "#form_text")} - ${first(
                        40,
                        "#form_text"
                      )})`
                    ),
                    "#text"
                  ),
                ],
              },
            },
            {
              pokemon_details: {
                type: "stack_panel",
                orientation: "horizontal",
                size: [165, 54],
                controls: [
                  {
                    text: {
                      type: "label",
                      size: [110, 55],
                      font_scale_factor: 0.6,
                      color: "white",
                      anchor_from: "top_left",
                      anchor_to: "top_left",
                      text: "#text",
                      bindings: [
                        globalBinding("#form_text"),
                        viewBinding(
                          strip(
                            `(${first(400, "#form_text")} - ${first(
                              80,
                              "#form_text"
                            )})`
                          ),
                          "#text"
                        ),
                      ],
                    },
                  },
                  {
                    "icon@pokedex.button_stack": {
                      size: [55, 55],
                      $offset: [0, 2],
                      layer: 4,
                      $button: "pokedex.icon",
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
        },
      },
    ],
  });

  const mainGridWindow = image(
    "main_grid_window",
    "textures/ui/pokedex/grid_background"
  )
    .size(233, 299)
    .anchor("center")
    .layer(1)
      .controls(
        {
          "close_button@common.light_close_button": {
            $close_button_offset: [-10, 111],
          },
        },
        {
          "search_button@pokedex.button_stack": {
            size: [163, 12],
            offset: [32, 116],
            layer: 4,
            $button: "pokedex.search_button",
          },
        },
        {
          page_management_buttons: {
            type: "stack_panel",
            orientation: "vertical",
            size: ["100%", "100%"],
            offset: [196, 144],
            controls: [
              {
                "page_management@pokedex.button_stack": {
                  size: [11, 26],
                  layer: 4,
                  $button: "pokedex.previous_page_button",
                },
              },
              {
                "page_management@pokedex.button_stack": {
                  size: [11, 26],
                  layer: 4,
                  $button: "pokedex.next_page_button",
                },
              },
            ],
          },
        },
        {
          pokedex_info_buttons: {
            type: "stack_panel",
            orientation: "horizontal",
            size: ["100%", "100%"],
            offset: [32, 207],
            controls: [
              {
                "caught_pokemon@pokedex.button_stack": {
                  size: [54, 17],
                  layer: 4,
                  $button: "pokedex.caught_pokemon_button",
                },
              },
              { spacer: { type: "panel", size: [0.5, 17] } },
              {
                "seen_pokemon@pokedex.button_stack": {
                  size: [54, 17],
                  layer: 4,
                  $button: "pokedex.seen_pokemon_button",
                },
              },
              { spacer_2: { type: "panel", size: [0.5, 17] } },
              {
                "completion@pokedex.button_stack": {
                  size: [54, 17],
                  layer: 4,
                  $button: "pokedex.completion_button",
                },
              },
            ],
          },
        },
        {
          small_chest_grid: {
            type: "grid",
            // @ts-ignore
            grid_dimensions: [9, 4],
            size: [162, 72],
            offset: [34, 132],
            anchor_from: "top_left",
            anchor_to: "top_left",
            grid_item_template: "chest_ui.chest_item",
            collection_name: "form_buttons",
            layer: 1,
          },
        }
      );

  const backgroundFade = image("background_fade", "textures/ui/Black")
    .alpha(0.5)
    .size("300%", "300%")
    .anchor("center")
    .layer(0);

  const [, finalNs] = ns.add(
    panel("main_grid")
      .fullSize()
      .controls(backgroundFade, mainGridWindow)
  );
  return finalNs;
});

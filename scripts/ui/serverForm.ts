/**
 * Server Form UI
 *
 * Main server form screen that routes to different UI screens based on title flags.
 */

import {
  panel,
  stackPanel,
  boundImage,
  contains,
  factory,
  notContain,
  redefineUI,
  screen,
  extendExternal,
  extendRaw,
  siblingViewBinding,
  imageTextureBindings,
  collectionDetailsBinding,
  collectionBinding,
  viewBinding,
} from "mcbe-ts-ui";

import { mount as pokemonMount } from "./pokemon/pokemon";
import { mount as pokedexMount } from "./pokemon/pokedex";
import { mount as battleMount } from "./pokemon/attackScreen";
import { mount as chestMount } from "./chestServerForm";
import { mount as rotomPhoneFirstMount } from "./rotomPhone/first";
import { mount as rotomPhoneSecondMount } from "./rotomPhone/second";
import { mount as rotomPhoneThirdMount } from "./rotomPhone/third";
import { mount as pcMount } from "./pokemon/pc";

const POKEMON_FLAGS = ["§p§o§k§e§1", "§p§o§k§e§s"] as const;

const FLAGS = {
  pokedex: "§d§e§k§x",
  pokedexDetails: "§d§e§d§e§t§k",
  battle: "§b§a§t§l§e",
  chestGui: "§c§h§e§s§t",
  searchUi: "§s§e§a§r§c",
  rotomPhoneFirst: "§1§r",
  rotomPhoneSecond: "§2§r",
  rotomPhoneThird: "§3§r",
  pc: "§p§c",
} as const;

const ALL_FLAGS_EXPR = [
  ...POKEMON_FLAGS.map((flag) => `'${flag}'`),
  ...Object.values(FLAGS).map((flag) => `'${flag}'`),
].join(" - ");

const pokemonFlagBindings = () => [
  {
    binding_type: "global" as const,
    binding_condition: "none" as const,
    binding_name: "#title_text",
    binding_name_override: "#title_text",
  },
  {
    binding_name: "#null",
    source_property_name: POKEMON_FLAGS.map(
      (flag) => `(not ((#title_text - '${flag}') = #title_text))`
    ).join(" or "),
    binding_type: "view" as const,
    target_property_name: "#visible",
  },
  {
    binding_name: "#null",
    source_property_name: POKEMON_FLAGS.map(
      (flag) => `(not ((#title_text - '${flag}') = #title_text))`
    ).join(" or "),
    binding_type: "view" as const,
    target_property_name: "#enabled",
  },
];

const flagBindings = (flag: string, flip = false) => [
  {
    binding_type: "global" as const,
    binding_condition: "none" as const,
    binding_name: "#title_text",
    binding_name_override: "#title_text",
  },
  {
    binding_name: "#null",
    source_property_name: flip
      ? notContain("#title_text", flag, false)
      : contains("#title_text", flag),
    binding_type: "view" as const,
    target_property_name: "#visible",
  },
  {
    binding_name: "#null",
    source_property_name: flip
      ? notContain("#title_text", flag, false)
      : contains("#title_text", flag),
    binding_type: "view" as const,
    target_property_name: "#enabled",
  },
];

const longFormPanel = panel("long_form")
  .extends("common_dialogs.main_panel_no_buttons")
  .size(260, 210);

const customFormPanel = panel("custom_form")
  .extends("common_dialogs.main_panel_no_buttons")
  .size(260, 210);

const defaultLongFormRouteBindings = [
  {
    binding_type: "global" as const,
    binding_condition: "none" as const,
    binding_name: "#title_text",
    binding_name_override: "#title_text",
  },
  {
    binding_name: "#null",
    source_property_name: `((#title_text - ${ALL_FLAGS_EXPR}) = #title_text)`,
    binding_type: "view" as const,
    target_property_name: "#visible",
  },
  {
    binding_name: "#null",
    source_property_name: `((#title_text - ${ALL_FLAGS_EXPR}) = #title_text)`,
    binding_type: "view" as const,
    target_property_name: "#enabled",
  },
];

const longFormRoute = panel("long_form")
  .extends("server_form.long_form")
  .enabled(false)
  .visible(false)
  .bindings(...defaultLongFormRouteBindings);

const pokedexDetailsPanel = panel("pokedex_details")
  .extends("pokedex.pokemon_details")
  .enabled(false)
  .visible(false)
  .bindings(...flagBindings(FLAGS.pokedexDetails));

const searchUiPanel = panel("search_ui")
  .extends("search_server_form.long_form")
  .enabled(false)
  .visible(false)
  .bindings(...flagBindings(FLAGS.searchUi));

const ngLongForm = panel("ng_long_form")
  .fullSize()
  .variable("flag_pokedex", FLAGS.pokedex)
  .variable("flag_pokedex_details", FLAGS.pokedexDetails)
  .variable("flag_battle", FLAGS.battle)
  .variable("flag_chestGui", FLAGS.chestGui)
  .variable("flag_searchUi", FLAGS.searchUi)
  .variable("flag_rotom_phone_first", FLAGS.rotomPhoneFirst)
  .variable("flag_rotom_phone_second", FLAGS.rotomPhoneSecond)
  .variable("flag_rotom_phone_third", FLAGS.rotomPhoneThird)
  .variable("flag_pc", FLAGS.pc);

const dynamicButtonNamePanel = panel("panel_name")
  .size(34, "100%c")
  .bindings(siblingViewBinding("image", "(not (#texture = ''))", "#visible"))
  .controls(
    boundImage("image")
      .layer(2)
      .size(32, 32)
      .offset(-2, 0)
      .bindings(...imageTextureBindings()),
    extendRaw("progress", "progress.progress_loading_bars", {
      size: [30, 4],
      offset: [-2, 16],
      bindings: [
        siblingViewBinding("image", "(#texture = 'loading')", "#visible"),
      ],
    })
  );

const dynamicButton = stackPanel("dynamic_button", "horizontal")
  .size("100%", 32)
  .controls(
    dynamicButtonNamePanel,
    extendRaw("form_button", "common_buttons.light_text_button", {
      $pressed_button_name: "button.form_button_click",
      anchor_from: "top_left",
      anchor_to: "top_left",
      size: ["fill", 32],
      $button_text: "#form_button_text",
      $button_text_binding_type: "collection",
      $button_text_grid_collection_name: "form_buttons",
      $button_text_max_size: ["100%", 20],
      bindings: [
        collectionDetailsBinding(),
        {
          ...collectionBinding("#form_button_text"),
          binding_condition: "none",
        },
        viewBinding("(not((%.1s * #form_button_text) = ' '))", "#enabled"),
      ],
    })
  );

const serverFormFactory = factory("server_form_factory").controlIds({
  long_form: "@server_form.ng_long_form",
  custom_form: "@server_form.custom_form",
});

const ngMainScreenContent = panel("ng_main_screen_content")
  .fullSize()
  .controls(serverFormFactory);

const thirdPartyServerScreen = screen("third_party_server_screen")
  .extends("common.base_screen")
  .variable("screen_content", "server_form.ng_main_screen_content")
  .buttonMappings({
    from_button_id: "button.menu_cancel",
    to_button_id: "button.menu_exit",
    mapping_type: "global",
  });

export default redefineUI("server_form", (ns) => {
  longFormPanel.addToNamespace(ns);
  customFormPanel.addToNamespace(ns);

  ngLongForm
    .controls(
      longFormRoute,
      extendExternal("pokemon_battle", battleMount)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.battle)),
      extendExternal("pokemon", pokemonMount)
        .enabled(false)
        .visible(false)
        .bindings(...pokemonFlagBindings()),
      extendExternal("pokedex", pokedexMount)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.pokedex)),
      extendExternal("pc", pcMount)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.pc)),
      pokedexDetailsPanel,
      extendExternal("chest_ui", chestMount)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.chestGui)),
      searchUiPanel,
      extendExternal("rotom_phone_first", rotomPhoneFirstMount)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.rotomPhoneFirst)),
      extendExternal("rotom_phone_second", rotomPhoneSecondMount)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.rotomPhoneSecond)),
      extendExternal("rotom_phone_third", rotomPhoneThirdMount)
        .enabled(false)
        .visible(false)
        .bindings(...flagBindings(FLAGS.rotomPhoneThird))
    )
    .addToNamespace(ns);

  dynamicButton.addToNamespace(ns);
  ngMainScreenContent.addToNamespace(ns);
  thirdPartyServerScreen.addToNamespace(ns);

  return ns;
});

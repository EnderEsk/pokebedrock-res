import {
  defineUI,
  varRef,
  panel,
  image,
  stackPanel,
  extend,
  phudVisibility,
  notEmpty,
  texturePath,
  variableParserBindings,
  sourceControlBinding,
  viewBinding,
  boundLabel,
  boundImage,
  element,
  ref,
} from "mcbe-ts-ui";

export const NAMESPACE = "phud_sidebar";
export const INSTANCE = "sidebar";

/** Cross-namespace mount into `phud.elements`. */
export const mainRef = (overrides: Record<string, unknown> = {}) =>
  ref(`${INSTANCE}@${NAMESPACE}.main`, overrides);

// BEH sidebar packs 7 fields per slot: stats|name|id|active|ball|icon|xp
const POKEMON_DATA_SIZE = 7;
const VARIABLE_PARSER = `${NAMESPACE}.variable_parser`;

const pokemonIndexMap = {
  stats: 0,
  name: 1,
  id: 2,
  active: 3,
  caughtWith: 4,
  icon: 5,
  xp: 6,
} as const;

const variableParser = element("variable_parser")
  .variableDefault("visible", "true")
  .bindings(...variableParserBindings());

const pokemonNameLabel = boundLabel("pokemon_name", "var")
  .extends(VARIABLE_PARSER, false)
  .enableProfanityFilter()
  .textAlignment("right")
  .linePadding(2)
  .layer(5)
  .color("$color")
  .fontScale(0.7);

const pokemonNameWrapper = panel("pokemon_name_wrapper")
  .variable("var_index", varRef("pokemon_name_index"))
  .size("100%", 5)
  .controls(pokemonNameLabel);

const pokemonStatsLabel = boundLabel("pokemon_stats", "var")
  .extends(VARIABLE_PARSER, false)
  .layer(5)
  .textAlignment("right")
  .linePadding(2)
  .color("$color")
  .fontScale(0.5);

const pokemonStatsWrapper = panel("pokemon_stats_wrapper")
  .variable("var_index", varRef("pokemon_stats_index"))
  .size("100%", 5)
  .controls(pokemonStatsLabel);

// XP bar: clip_ratio = field% * 0.01 (must use float $var — literal /100 breaks binding)
const xpBarFill = image("xp_bar_fill", "textures/ui/filled_progress_bar")
  .color([0.25, 0.6, 1.0])
  .clipDirection("left")
  .clipPixelPerfect(false)
  .clipRatio(1.0)
  .fullSize()
  .layer(5)
  .variable("percent_to_ratio", 0.01)
  .bindings(
    sourceControlBinding("elements", "#sidebar", "#string"),
    viewBinding("$string_parser", "#field"),
    {
      binding_name: "#null",
      binding_type: "view",
      source_property_name: "((#field * 1) * $percent_to_ratio)",
      target_property_name: "#clip_ratio",
      binding_condition: "always",
    }
  );

const xpBar = panel("xp_bar")
  .size(62, "100%")
  .offset(2, 0)
  .controls(
    image("xp_bar_background", "textures/ui/Black").alpha(0.8).fullSize().layer(4),
    xpBarFill
  );

const xpBarWrapper = panel("xp_bar_wrapper")
  .variable("var_index", varRef("pokemon_xp_index"))
  .size("100%", 2)
  .controls(xpBar);

const pokemonDataStack = stackPanel("pokemon_data_stack", "vertical")
  .anchor("top_middle")
  .offset(0, 8)
  .size("100%", "90%c")
  .controls(
    pokemonNameWrapper,
    panel("padding").size("100%", 1),
    pokemonStatsWrapper,
    panel("xp_bar_padding").size("100%", 1),
    xpBarWrapper
  );

const pokemonDataImage = image("pokemon_data", "textures/ui/sidebar/data")
  .extends(VARIABLE_PARSER, false)
  .offset("-11%", "0%")
  .size("80%", 27)
  .layer(2)
  .variable("visible", "(not(#var = 'null'))")
  .controls(pokemonDataStack);

const pokemonIcon = boundImage("pokemon_icon")
  .offset("0%", "-15%")
  .size("100%y", "100%")
  .variable("var_index", varRef("pokemon_icon_index"))
  .layer(4);
pokemonIcon.bindings(
  sourceControlBinding("elements", "#sidebar", "#string"),
  viewBinding("$string_parser", "#pokemon_icon"),
  viewBinding(
    texturePath("textures/sprites/", "#pokemon_icon"),
    `#${pokemonIcon.bindingName}`
  ),
  viewBinding(notEmpty("#pokemon_icon").replace("''", "'null'"), "#visible")
);

const ballIcon = boundImage("ball_icon")
  .texture("#texture")
  .size("100%y", "100%")
  .layer(3)
  .controls(pokemonIcon);
ballIcon.bindings(
  sourceControlBinding("elements", "#sidebar", "#string"),
  viewBinding("$string_parser", "#ball_type"),
  viewBinding(
    texturePath("textures/ui/sidebar/balls/", "#ball_type"),
    `#${ballIcon.bindingName}`
  )
);

const pokemonIconWrapper = panel("pokemon_icon_wrapper")
  .variable("var_index", varRef("pokemon_caughtWith_index"))
  .controls(ballIcon);

const activeIcon = image("active_icon", "textures/ui/sidebar/ring")
  .extends(VARIABLE_PARSER, false)
  .size("100%y", "100%")
  .layer(5)
  .variable("visible", "#var");

const pokemonSelectedIndicator = panel("pokemon_selected_indicator")
  .variable("var_index", varRef("pokemon_active_index"))
  .controls(activeIcon);

const pokemonSlotTemplate = panel("pokemon_sidebar_pokemon")
  .size("100%", 32)
  .variableDefaults({
    pokemon_stats_index: 0,
    pokemon_name_index: 1,
    pokemon_id_index: 2,
    pokemon_active_index: 3,
    pokemon_caughtWith_index: 4,
    pokemon_icon_index: 5,
    pokemon_xp_index: 6,
  })
  .variable("var_index", varRef("pokemon_id_index"))
  .controls(pokemonDataImage, pokemonIconWrapper, pokemonSelectedIndicator);

export default defineUI(NAMESPACE, (ns) => {
  variableParser.addToNamespace(ns);
  const slotTemplate = pokemonSlotTemplate.addToNamespace(ns);

  const slots = Array.from({ length: 6 }, (_, slotIndex) => {
    const slot = extend(`pokemon${slotIndex + 1}`, slotTemplate);
    const base = slotIndex * POKEMON_DATA_SIZE;
    for (const key in pokemonIndexMap)
      slot.variable(
        `pokemon_${key}_index`,
        base + pokemonIndexMap[key as keyof typeof pokemonIndexMap]
      );
    return slot;
  });

  const dock = image("dock", "textures/ui/sidebar/dock")
    .anchor("right_middle")
    .size("100%", "100%")
    .offset("47%", "0%")
    .layer(1)
    .variable("var_size", 121)
    .variable("color", "white")
    .controls(
      stackPanel("pokemon_holder", "vertical")
        .size("100%", "100%c")
        .controls(...slots)
    );

  return ns.setMain(
    panel("main")
      .anchor("right_middle")
      .size("222.22%y", 192)
      .controls(dock)
      .bindings(...phudVisibility("#sidebar"))
  );
});

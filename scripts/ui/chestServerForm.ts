/**
 * Chest Server Form UI
 *
 * Custom chest-like form interfaces with multiple layout variants.
 */

import {
  defineUI,
  panel,
  stackPanel,
  image,
  label,
  grid,
  button,
  custom,
  boundImage,
  ref,
  extendRaw,
  extend,
  chestVisibility,
  itemTextureBindings,
  nonRendererItemBindings,
  formButtonPrefixVisibility,
  hoverTextBindings,
  collectionBinding,
  collectionBindingNone,
  collectionDetailsBinding,
  viewBinding,
  type SizeValue,
  type OffsetValue,
  type ElementBuilder,
} from "mcbe-ts-ui";

const FLAGS = {
  inventoryChest: "§c§h§e§s§t§s§i§n§v§e§n§t",
  singleChest: "§c§h§e§s§t§s§i§n§g§l§e§r",
  tinyChest: "§c§h§e§s§t§t§i§n§n§y§r",
  smallChest: "§c§h§e§s§t§s§m§a§l§l",
  largeChest: "§c§h§e§s§t§l§a§r§g§e",
  questChest: "§c§h§e§s§t§s§q§u§e§s§t§s",
  questChestLarge: "§c§h§e§s§t§s§l§u§e§s§t§s",
  pokebuilder: "§c§h§e§s§t§p§o§k§b§u§i§l",
  pokebuilderLarge: "§c§h§e§s§t§p§o§k§e§b§u§L",
  backpack: "§c§h§e§s§t§s§b§a§c§k§p§a",
  auctionHouse: "§c§h§e§s§t§a§u§c§t§i§o§n",
} as const;

const textureBindings = itemTextureBindings("form_buttons", {
  stripBracketSuffix: true,
});

const tPrefixVisible = [
  collectionBinding("#form_button_text"),
  collectionDetailsBinding(),
  viewBinding(
    "((('%.6s' * #form_button_text) - ('%.4s' * #form_button_text)) = 't:')",
    "#visible"
  ),
];

const inventoryText = label("inventory_text", "container.inventory")
  .anchor("top_left")
  .offset(7, "100% - 90px")
  .size("90%", "default")
  .layer(2)
  .color("$title_text_color");

type ChestGridOpts = {
  texture: string;
  size: [SizeValue, SizeValue];
  dims: [number, number];
  gridName: string;
  gridSize: [SizeValue, SizeValue];
  gridOffset: [OffsetValue, OffsetValue];
  flag: string;
  closeBtn?: string;
  closeOffset?: [number, number];
  offset?: [OffsetValue, OffsetValue];
  labelOffset?: [OffsetValue, OffsetValue];
  showLabel?: boolean;
  showInventoryText?: boolean;
};

/**
 * Image shell + nested form_buttons grid + chest-type visibility.
 *
 * @param name - Namespace element name.
 * @param opts - Texture, grid, close button, and flag options.
 * @returns Image builder ready for `addToNamespace`.
 */
function chestGridImage(
  name: string,
  opts: ChestGridOpts
): ElementBuilder<string> {
  const closeBtn = opts.closeBtn ?? "common.close_button";
  const closeOffset = opts.closeOffset ?? [-2, 2];
  const showLabel = opts.showLabel !== false;
  const controls: Array<ReturnType<typeof ref> | ElementBuilder<string>> = [];

  if (showLabel) {
    controls.push(
      opts.labelOffset
        ? ref("chest_label@chest_ui.chest_label", { offset: opts.labelOffset })
        : ref("chest_label@chest_ui.chest_label")
    );
  }

  controls.push(
    extendRaw("close_button", closeBtn, {
      $close_button_offset: closeOffset,
    }),
    grid(opts.gridName)
      .gridDimensions(...opts.dims)
      .size(...opts.gridSize)
      .offset(...opts.gridOffset)
      .anchor("top_left")
      .gridItemTemplate("chest_ui.chest_item")
      .collectionName("form_buttons")
      .layer(1)
  );

  if (opts.showInventoryText) controls.push(inventoryText);

  let img = image(name, opts.texture).size(...opts.size).layer(0);
  if (opts.offset) img = img.offset(...opts.offset);
  return img.controls(...controls).bindings(...chestVisibility(opts.flag));
}

export default defineUI("chest_ui", (ns) => {
  label("chest_label", "#title_text")
    .offset(7, 10)
    .anchor("top_left")
    .size("90%", "default")
    .color("$title_text_color")
    .layer(2)
    .addToNamespace(ns);

  boundImage("non_renderer_item")
    .size(16, 16)
    .bindings(...nonRendererItemBindings())
    .addToNamespace(ns);

  panel("inventory_button_amount")
    .rawProp("offset", "$offset")
    .controls(
      label("item_amount", "#stack_size")
        .offset(0, 1)
        .shadow()
        .textAlignment("left")
        .anchor("bottom_right")
        .color("$tool_tip_text")
        .layer(4)
        .bindings(
          collectionBindingNone(),
          collectionDetailsBinding(),
          collectionBinding("#form_button_text"),
          viewBinding(
            "((#form_button_text - 'stack#01') = #form_button_text)",
            "#visible"
          ),
          viewBinding(
            "(('§z') + (('%.14s' * #form_button_text) - ('%.12s' * #form_button_text)))",
            "#stack_size"
          )
        )
    )
    .addToNamespace(ns);

  panel("default_control")
    .wrapChildren()
    .layer(3)
    .controls(
      extendRaw("item_block", "beacon.item_renderer", {
        size: [16, 16],
        offset: "$offset",
        bindings: "$texture_bindings",
      }),
      ref("non_renderer_item@chest_ui.non_renderer_item", {
        offset: "$offset",
      })
    )
    .addToNamespace(ns);

  panel("hover_control")
    .wrapChildren()
    .rawProp("offset", "$offset")
    .controls(
      panel("hovering_image")
        .size(18, 18)
        .controls(
          custom("item_details")
            .renderer("hover_text_renderer")
            .allowClipping(false)
            .layer(30)
            .bindings(...hoverTextBindings(58)),
          extendRaw("item_block", "beacon.item_renderer", {
            size: [16, 16],
            bindings: "$texture_bindings",
            layer: 3,
            offset: [1, 1],
          }),
          ref("non_renderer_item@chest_ui.non_renderer_item", { layer: 3 }),
          image("highlight_slot", "textures/ui/highlight_slot")
            .size(18, 18)
            .layer(0)
            .bindings(...tPrefixVisible),
          image("focus_border", "textures/ui/focus_border_white")
            .size(18, 18)
            .layer(1)
            .bindings(...tPrefixVisible)
        )
    )
    .addToNamespace(ns);

  panel("pressed_control")
    .wrapChildren()
    .controls(
      extendRaw("item_block", "beacon.item_renderer", {
        size: [16, 16],
        offset: "$offset",
        bindings: "$texture_bindings",
      }),
      ref("non_renderer_item@chest_ui.non_renderer_item", {
        offset: "$offset",
      })
    )
    .addToNamespace(ns);

  const inventoryButton = button("inventory_button")
    .extends("common.button")
    .variable("pressed_button_name", "button.form_button_click")
    .defaultControl("default")
    .hoverControl("hover")
    .pressedControl("pressed")
    .rawProp("offset", "$offset")
    .variable("texture_bindings", textureBindings)
    .controls(
      ref("inventory_button_amount@chest_ui.inventory_button_amount"),
      ref("slot_badge@chest_ui.slot_badge"),
      ref("default@chest_ui.default_control"),
      ref("hover@chest_ui.hover_control"),
      ref("pressed@chest_ui.pressed_control")
    )
    .addToNamespace(ns);

  extend("ui_chest_item", inventoryButton)
    .variable("offset", [-1, -1])
    .bindings(...formButtonPrefixVisibility("cht:"))
    .addToNamespace(ns);

  extend("ui_inventory_item", inventoryButton)
    .variable("offset", [-1, 10])
    .bindings(...formButtonPrefixVisibility("inv:"))
    .addToNamespace(ns);

  extend("ui_hot_bar_item", inventoryButton)
    .variable("offset", [-1, 13])
    .bindings(...formButtonPrefixVisibility("hot:"))
    .addToNamespace(ns);

  panel("slot_badge")
    .rawProp("offset", "$offset")
    .controls(
      boundImage("badge_image")
        .size(8, 8)
        .offset(1, 1)
        .anchor("top_left")
        .layer(5)
        .bindings(
          collectionBindingNone(),
          collectionDetailsBinding(),
          collectionBinding("#form_button_text"),
          viewBinding(
            "((('%.18s' * #form_button_text) - ('%.14s' * #form_button_text)) = 'bdg#')",
            "#visible"
          ),
          viewBinding(
            "((('%.58s' * #form_button_text) - ('%.18s' * #form_button_text)) - ' ')",
            "#texture"
          )
        )
    )
    .addToNamespace(ns);

  stackPanel("chest_item", "vertical")
    .variableDefault("item_size", [18, 18])
    .rawProp("size", "$item_size")
    .layer(2)
    .controls(
      ref("chest_item@chest_ui.ui_chest_item"),
      ref("inventory_item@chest_ui.ui_inventory_item"),
      ref("hot_bar_item@chest_ui.ui_hot_bar_item")
    )
    .addToNamespace(ns);

  chestGridImage("inventory_chest_grid_image", {
    texture: "textures/ui/gui/inventory",
    size: [176, 96],
    dims: [9, 4],
    gridName: "inventory_grid",
    gridSize: [162, 72],
    gridOffset: [8, 6],
    flag: FLAGS.inventoryChest,
    closeOffset: [-2, 1],
    labelOffset: [7, 5],
  }).addToNamespace(ns);

  chestGridImage("single_chest_grid_image", {
    texture: "textures/ui/gui/generic_1",
    size: [176, 130],
    dims: [9, 5],
    gridName: "single_chest_grid",
    gridSize: [162, 90],
    gridOffset: [8, 22],
    flag: FLAGS.singleChest,
    showInventoryText: true,
  }).addToNamespace(ns);

  chestGridImage("tiny_chest_grid_image", {
    texture: "textures/ui/gui/generic_9",
    size: [176, 130],
    dims: [9, 1],
    gridName: "tiny_chest_grid",
    gridSize: ["100% - 14px", "100% - 112px"],
    gridOffset: [8, 22],
    flag: FLAGS.tinyChest,
    showInventoryText: true,
  }).addToNamespace(ns);

  chestGridImage("small_chest_grid_image", {
    texture: "textures/ui/gui/generic_27",
    size: [176, 166],
    dims: [9, 8],
    gridName: "small_chest_grid",
    gridSize: ["100% - 14px", 144],
    gridOffset: [8, 22],
    flag: FLAGS.smallChest,
    showInventoryText: true,
  }).addToNamespace(ns);

  chestGridImage("large_chest_grid_image", {
    texture: "textures/ui/gui/generic_54",
    size: [176, 220],
    dims: [9, 6],
    gridName: "large_chest_grid",
    gridSize: [162, "100% - 112px"],
    gridOffset: [8, 22],
    flag: FLAGS.largeChest,
    closeBtn: "common.light_close_button",
    showInventoryText: true,
  }).addToNamespace(ns);

  chestGridImage("quests_grid_image", {
    texture: "textures/ui/quests/chest_screen",
    size: [194, 128],
    offset: [0, -5],
    dims: [9, 3],
    gridName: "quest_chest_grid",
    gridSize: [162, 54],
    gridOffset: [18, 65],
    flag: FLAGS.questChest,
    closeOffset: [-10, 52],
    showLabel: false,
  }).addToNamespace(ns);

  chestGridImage("quests_grid_large_image", {
    texture: "textures/ui/quests/chest_screen_large",
    size: [194, 179],
    offset: [0, -5],
    dims: [9, 6],
    gridName: "quest_chest_grid",
    gridSize: [162, 108],
    gridOffset: [19, 62],
    flag: FLAGS.questChestLarge,
    closeOffset: [-10, 52],
    showLabel: false,
  }).addToNamespace(ns);

  chestGridImage("pokebuilder_grid_image", {
    texture: "textures/ui/pokebuilder/27_slot_pokebuilder",
    size: [200, 200],
    offset: [0, -5],
    dims: [9, 3],
    gridName: "pokebuilder_chest_grid",
    gridSize: [162, "100% - 146px"],
    gridOffset: [20, 114],
    flag: FLAGS.pokebuilder,
    closeOffset: [-4, 94],
    showLabel: false,
  }).addToNamespace(ns);

  chestGridImage("pokebuilder_grid_large_image", {
    texture: "textures/ui/pokebuilder/45_slot_pokebuilder",
    size: [200, 200],
    offset: [0, -5],
    dims: [9, 6],
    gridName: "pokebuilder_chest_grid",
    gridSize: [162, 108],
    gridOffset: [17, 67],
    flag: FLAGS.pokebuilderLarge,
    closeOffset: [-10, 52],
    showLabel: false,
  }).addToNamespace(ns);

  chestGridImage("backpack_grid", {
    texture: "textures/ui/gui/backpack",
    size: [245, 216],
    offset: [0, -5],
    dims: [10, 9],
    gridName: "backpack_chest_grid",
    gridSize: [180, 162],
    gridOffset: [33, 41],
    flag: FLAGS.backpack,
    closeOffset: [-20, 10],
    showLabel: false,
  }).addToNamespace(ns);

  chestGridImage("auction_house_grid", {
    texture: "textures/ui/gui/auction",
    size: [206, 186],
    offset: [0, -5],
    dims: [9, 6],
    gridName: "auction_house_chest_grid",
    gridSize: [162, "100% - 78px"],
    gridOffset: [20, 58],
    flag: FLAGS.auctionHouse,
    closeOffset: [-20, 40],
    showLabel: false,
  }).addToNamespace(ns);

  const [, finalNs] = ns.add(
    panel("chest_panel")
      .wrapChildren()
      .controls(
        ref("inventory_chest_grid_image@chest_ui.inventory_chest_grid_image"),
        ref("single_chest_grid_image@chest_ui.single_chest_grid_image"),
        ref("tiny_chest_grid_image@chest_ui.tiny_chest_grid_image"),
        ref("small_chest_grid_image@chest_ui.small_chest_grid_image"),
        ref("large_chest_grid_image@chest_ui.large_chest_grid_image"),
        ref("quests_grid_image@chest_ui.quests_grid_image"),
        ref("quests_grid_large_image@chest_ui.quests_grid_large_image"),
        ref("pokebuilder_grid_image@chest_ui.pokebuilder_grid_image"),
        ref(
          "pokebuilder_grid_large_image@chest_ui.pokebuilder_grid_large_image"
        ),
        ref("backpack_grid@chest_ui.backpack_grid"),
        ref("auction_house_grid@chest_ui.auction_house_grid")
      )
  );
  return finalNs;
});

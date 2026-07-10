/**
 * Shared utilities for Rotom Phone UI pages
 */

import {
  panel,
  stackPanel,
  label,
  image,
  boundImage,
  contains,
  collectionBinding,
  factoryBindings,
  viewBinding,
  collectionDetailsBinding,
  imageTextureBindings,
  siblingImageVisibilityBinding,
  buttonFlagVisibility,
  globalBinding,
  extendRaw,
  ref,
  NamespaceBuilder,
  SizeValue,
  Size,
  PanelBuilder,
  LabelBuilder,
} from "mcbe-ts-ui";

// Common button flag prefixes
export const FLAGS = {
  image: "§i§i§r",
  top: "§t§r",
  leftBig: "§l§b§r",
  leftBigImage: "§l§b§i§r",
  leftBigSpecial: "§l§b§x§r",
  middleBig: "§m§b§r",
  middleMiddle: "§m§m§r",
  middleSmall: "§m§s§r",
  bottom: "§b§b§r",
  bottomRight: "§b§s§r",
} as const;

export type FlagKey = keyof typeof FLAGS;

// Button visibility binding helper
export const buttonVisibilityBindings = buttonFlagVisibility;

// Image visibility bindings
export const siblingImageBinding = () => siblingImageVisibilityBinding();
export const conditionalImageBinding = () =>
  viewBinding("(not (#texture = ''))", "#visible", "image");

// Button panel configuration type
export interface ButtonPanelConfig {
  name: string;
  flag: string;
  size?: [number, number];
  sizeImg?: [number, number];
  offsetImg?: [number, number];
  labelOffset?: [number, number];
  fontScale?: number;
  sizeType?: SizeValue;
  orientation?: "horizontal" | "vertical";
}

// Button stack configuration type
export interface ButtonStackConfig {
  name: string;
  panel: string;
  orientation: "horizontal" | "vertical";
  offset: [number, number];
  size?: Size;
}

// Label configuration type
export interface LabelConfig {
  name: string;
  text: string;
  size: [number, number];
  offset: [number, number];
  fontScale: number;
}

// Button textures configuration
export interface ButtonTexturesConfig {
  default: string;
  hover: string;
  pressed: string;
}

const DEFAULT_TEXTURES: ButtonTexturesConfig = {
  default: "textures/ui/gui/rotom_phone/form_btn_background",
  hover: "textures/ui/gui/rotom_phone/form_btn_background_interact",
  pressed: "textures/ui/gui/rotom_phone/form_btn_background_interact",
};

const FORM_TEXTURES: ButtonTexturesConfig = {
  default: "textures/ui/form_btn_background",
  hover: "textures/ui/form_btn_background_interact",
  pressed: "textures/ui/form_btn_background_interact",
};

// Create base button template
export function createButtonTemplate(
  ns: NamespaceBuilder,
  options: {
    useSiblingImageBinding?: boolean;
    textures?: ButtonTexturesConfig;
  } = {}
) {
  const { useSiblingImageBinding = false, textures = DEFAULT_TEXTURES } =
    options;

  stackPanel("button", "vertical")
    .rawProp("size", "$size")
    .variableDefault("size", [14, 8])
    .variableDefault("size_img", [8, 8])
    .variableDefault("offset_img", [0, 0])
    .variableDefault("anchor_value", "bottom_middle")
    .variableDefault("button_font_scale_factor_value", 1)
    .variableDefault("new_ui_label_offset_value", [0, 0])
    .variableDefault("source_property_flag", "")
    .bindings(
      ...(useSiblingImageBinding
        ? buttonVisibilityBindings("$flag")
        : [
            collectionBinding("#form_button_text"),
            viewBinding("$source_property_flag", "#visible"),
          ])
    )
    .controls(
      panel("image_panel")
        .rawProp("size", "$size_img")
        .bindings(
          useSiblingImageBinding
            ? siblingImageBinding()
            : conditionalImageBinding()
        )
        .controls(
          boundImage("image")
            .layer(99)
            .rawProp("offset", "$offset_img")
            .bindings(...imageTextureBindings())
        ),
      extendRaw("form_button", "common_buttons.light_text_button", {
        $pressed_button_name: "button.form_button_click",
        $default_button_texture: textures.default,
        $hover_button_texture: textures.hover,
        $pressed_button_texture: textures.pressed,
        $border_visible: false,
        focus_enabled: false,
        $button_text: "#form_button_text",
        $button_text_binding_type: "collection",
        $button_text_grid_collection_name: "form_buttons",
        $button_text_size: ["100%", "100%"],
        $button_text_max_size: ["100%", "100%"],
        $anchor: "$anchor_value",
        $button_font_scale_factor: "$button_font_scale_factor_value",
        $new_ui_label_offset: "$new_ui_label_offset_value",
        bindings: [collectionDetailsBinding()],
      })
    )
    .addToNamespace(ns);
}

// Process button panels configuration
export function createButtonPanels(
  ns: NamespaceBuilder,
  namespace: string,
  configs: ButtonPanelConfig[]
) {
  const verticalPanels = [
    "left_big",
    "middle_big",
    "middle_middle",
    "bottom_right",
  ];

  configs.forEach(
    ({
      name,
      flag,
      size,
      sizeImg,
      offsetImg,
      labelOffset,
      fontScale,
      sizeType,
      orientation,
    }) => {
      const isVertical =
        orientation === "vertical" ||
        (orientation === undefined &&
          verticalPanels.some((n) => name.includes(n)));
      const width: SizeValue = sizeType || (isVertical ? "100%" : "100%c");
      const height: SizeValue = isVertical ? "100%c" : "100%";

      const panelBuilder = panel(name)
        .size(width, height)
        .rawProp("$flag", flag);

      if (size) panelBuilder.rawProp("$size", size);
      if (sizeImg) panelBuilder.rawProp("$size_img", sizeImg);
      if (offsetImg) panelBuilder.rawProp("$offset_img", offsetImg);
      if (labelOffset)
        panelBuilder.rawProp("$new_ui_label_offset_value", labelOffset);
      if (fontScale)
        panelBuilder.rawProp("$button_font_scale_factor_value", fontScale);

      panelBuilder.controls(
        ref(`button@${namespace}.button`, {
          $source_property_flag: contains("#form_button_text", "$flag", false),
        })
      );

      panelBuilder.addToNamespace(ns);
    }
  );
}

// Process button stacks configuration
export function createButtonStacks(
  ns: NamespaceBuilder,
  namespace: string,
  configs: ButtonStackConfig[]
) {
  configs.forEach(({ name, panel: panelName, orientation, offset, size }) => {
    stackPanel(name, orientation)
      .rawProp("orientation", orientation)
      .size(size?.[0] ?? "100%c", size?.[1] ?? "20%")
      .offset(...offset)
      .factory("buttons", `${namespace}.${panelName}`)
      .collectionName("form_buttons")
      .bindings(...factoryBindings())
      .addToNamespace(ns);
  });
}

// Create a label builder
export function createLabel(config: LabelConfig): LabelBuilder<string> {
  return label(config.name, config.text)
    .size(config.size[0], config.size[1])
    .offset(...config.offset)
    .fontScaleFactor(config.fontScale);
}

// Create the top section (title + label + buttons) - common across all pages
export function createTopSection(namespace: string): PanelBuilder<"top"> {
  return panel("top").controls(
    label("title", "#title_text")
      .layer(99)
      .size(30, 15)
      .anchor("top_middle")
      .offset(47, "39%")
      .fontScaleFactor(0.55)
      .bindings(globalBinding("#title_text")),
    label("label", "#form_text")
      .layer(99)
      .size(70, 20)
      .anchor("top_middle")
      .offset(93, "39.5%")
      .fontScaleFactor(0.8),
    ref(`top_buttons@${namespace}.top_buttons`)
  );
}

// Create a simple panel wrapping buttons
export function createButtonWrapper(
  name: string,
  namespace: string,
  buttonsName: string
): PanelBuilder<string> {
  return panel(name).controls(
    ref(`${buttonsName}@${namespace}.${buttonsName}`)
  );
}

// Create main panel with close button and content
export function createMainPanel(
  namespace: string,
  page: "first" | "second" | "third"
): PanelBuilder<`blackbarbar_${typeof page}`> {
  return panel(`blackbarbar_${page}`).controls(
    extendRaw("close_button", "common.light_close_button", {
      $close_button_offset: [-10, 111],
    }),
    image("content", `textures/ui/gui/rotom_phone/${page}`)
      .rawProp("keep_ratio", true)
      .controls(ref(`button_controller@${namespace}.button_controller`))
  );
}

// Export texture configs for pages that need different textures
export { DEFAULT_TEXTURES, FORM_TEXTURES };

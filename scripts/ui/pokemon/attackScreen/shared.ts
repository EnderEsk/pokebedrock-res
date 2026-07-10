import {
  image,
  custom,
  collectionBinding,
  viewBinding,
  type NamespaceBuilder,
} from "mcbe-ts-ui";

export {
  visibilityForId,
  formButtonsDetailsBinding,
  formButtonTextBinding,
  formButtonTextureBinding,
  createButtonStack,
  formButtonEnabledBindings,
  formButtonTextLabelBindings,
  formButtonImageBindings,
  buttonTextureProps,
  simpleButtonTextures,
  defaultStateVars,
  hoverStateVars,
  pressedStateVars,
  lockedStateVars,
  type ButtonTextureConfig,
  buttonStack,
} from "../shared";

// Local bindings needed — `export { X } from` does not create locals in this module.
import { buttonStack, formButtonsDetailsBinding } from "../shared";

export const NS = "battle";

const hoverTextTooltip = custom("hover_text")
  .renderer("hover_text_renderer")
  .allowClipping(false)
  .layer(30)
  .bindings(
    collectionBinding("#form_button_text"),
    viewBinding(
      "(#form_button_text - (('%.' + $hover_text_index + 's') * #form_button_text))",
      "#hover_text"
    ),
    formButtonsDetailsBinding()
  );

export const buttonHoverControl = image(
  "button_hover_control",
  "$new_ui_button_texture"
)
  .variableDefault("hover_text_index", 0)
  .controls(hoverTextTooltip);

export function registerSharedElements(ns: NamespaceBuilder): void {
  buttonStack.addToNamespace(ns);
  buttonHoverControl.addToNamespace(ns);
}

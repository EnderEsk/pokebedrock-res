/**
 * Battle UI Shared Utilities
 *
 * Shared helpers and elements specific to the battle/attack screen.
 * Re-exports common utilities from parent shared module.
 */

import {
  image,
  custom,
  collectionBinding,
  viewBinding,
  type NamespaceBuilder,
} from "mcbe-ts-ui";

// Re-export common utilities from parent shared module
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

/** Namespace constant for battle UI */
export const NS = "battle";

/**
 * Hover text tooltip element using custom renderer
 */
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

/**
 * Button hover control with tooltip
 */
export const buttonHoverControl = image(
  "button_hover_control",
  "$new_ui_button_texture"
)
  .variableDefault("hover_text_index", 0)
  .controls(hoverTextTooltip);

/**
 * Register shared battle elements to the namespace.
 *
 * @param ns The battle UI namespace.
 */
export function registerSharedElements(ns: NamespaceBuilder): void {
  buttonStack.addToNamespace(ns);
  buttonHoverControl.addToNamespace(ns);
}

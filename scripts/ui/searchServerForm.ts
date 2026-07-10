/**
 * Search Server Form UI
 *
 * Extends the standard long form with a search bar for filtering buttons.
 */

import {
  defineUI,
  stackPanel,
  panel,
  label,
  extendRaw,
  ref,
  notPrefix,
  collectionDetailsBinding,
  collectionBinding,
  viewBinding,
} from "mcbe-ts-ui";

const scrollingPanel = extendRaw("scrolling_panel", "common.scrolling_panel", {
  anchor_to: "top_left",
  anchor_from: "top_left",
  $show_background: false,
  size: ["100%", "100%"],
  $scrolling_content: "search_server_form.long_form_scrolling_content",
  $scroll_size: [5, "100% - 4px"],
  $scrolling_pane_size: ["100% - 4px", "100% - 2px"],
  $scrolling_pane_offset: [2, 0],
  $scroll_bar_right_padding_size: [0, 0],
});

// Long form panel with scrolling
const longFormPanel = panel("long_form_panel")
  .extends("server_form.long_form_panel")
  .controls(scrollingPanel);

const mainLabel = label("main_label", "#form_text")
  .offset(2, 2)
  .color("$main_header_text_color")
  .size("100%", "default")
  .anchor("top_left");

const labelOffsetPanel = panel("label_offset_panel")
  .size("100%", "100%c")
  .controls(mainLabel);

const searchBar = extendRaw("search_bar", "common.text_edit_box", {
  $text_edit_text_control: "search_buttons",
  $place_holder_text: "Search...",
  max_length: 100,
  size: ["100%", 18],
  $text_edit_box_hovered_button_id: "button.search_bar_hovered",
  $text_edit_box_clear_to_button_id: "button.search_bar_clear",
  $text_edit_box_selected_to_button_id: "button.search_bar_selected",
  $text_edit_box_deselected_to_button_id: "button.search_bar_deselected",
  focus_wrap_enabled: true,
});

const scrollingPadding = panel("padding").size("100%", 4);

const wrappingPanel = panel("wrapping_panel")
  .size("100%", "100%c")
  .controls(
    ref(
      "long_form_dynamic_buttons_panel@search_server_form.long_form_dynamic_buttons_panel"
    )
  );

// Scrolling content with search bar
const longFormScrollingContent = stackPanel("long_form_scrolling_content", "vertical")
  .size("100% - 4px", "100%c")
  .anchor("top_left")
  .controls(labelOffsetPanel, searchBar, scrollingPadding, wrappingPanel);

// Dynamic buttons panel with factory
const longFormDynamicButtonsPanel = stackPanel(
  "long_form_dynamic_buttons_panel",
  "vertical"
)
  .size("100% - 4px", "100%c")
  .offset(2, 0)
  .anchor("top_middle")
  .factory("buttons", "search_server_form.search_template")
  .collectionName("form_buttons")
  .bindings({
    binding_name: "#form_button_length",
    binding_name_override: "#collection_length",
  });

// Search template button - filtered by search input
const searchTemplate = panel("search_template")
  .extends("common_buttons.light_text_button")
  .variable("pressed_button_name", "button.form_button_click")
  .size("100%", 32)
  .variable("button_text", "#form_button_text")
  .variable("button_text_binding_type", "collection")
  .variable("button_text_grid_collection_name", "form_buttons")
  .variable("button_text_max_size", ["100%", 30])
  .bindings(
    collectionDetailsBinding(),
    {
      ...collectionBinding("#form_button_text"),
      binding_condition: "none",
    },
    viewBinding("#item_name", "#search_em", "search_buttons"),
    viewBinding(
      "(((%.1s * #search_em) = '') or ((%.4s * #form_button_text) = 'Back') or (not ((#form_button_text - #search_em) = #form_button_text)))",
      "#visible"
    ),
    viewBinding(notPrefix(1, "#form_button_text", " "), "#enabled")
  );

// Long form extension
const longForm = panel("long_form")
  .extends("server_form.long_form")
  .variable("child_control", "search_server_form.long_form_panel");

export default defineUI("search_server_form", (ns) => {
  longFormPanel.addToNamespace(ns);
  longFormScrollingContent.addToNamespace(ns);
  longFormDynamicButtonsPanel.addToNamespace(ns);
  searchTemplate.addToNamespace(ns);
  longForm.addToNamespace(ns);
  return ns;
});

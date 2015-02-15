/**
 * Silex, live web creation
 * http://projects.silexlabs.org/?/silex/
 *
 * Copyright (c) 2012 Silex Labs
 * http://www.silexlabs.org/
 *
 * Silex is available under the GPL license
 * http://www.silexlabs.org/silex/silex-licensing/
 */

/**
 * @fileoverview Property pane, displayed in the property tool box.
 * Controls the borders params
 *
 */


goog.provide('silex.view.pane.BorderPane');
goog.require('goog.array');
goog.require('goog.cssom');
goog.require('goog.editor.Field');
goog.require('goog.object');
goog.require('goog.ui.Checkbox');
goog.require('goog.ui.ColorButton');
goog.require('goog.ui.HsvPalette');
goog.require('silex.view.pane.PaneBase');



/**
 * on of Silex Editors class
 * let user edit style of components
 * @constructor
 * @extends {silex.view.pane.PaneBase}
 * @param {Element} element   container to render the UI
 * @param  {!silex.types.Model} model  model class which holds
 *                                  the model instances - views use it for read operation only
 * @param  {!silex.types.Controller} controller structure which holds
 *                                  the controller instances
 */
silex.view.pane.BorderPane = function(element, model, controller) {
  // call super
  goog.base(this, element, model, controller);
  // init the component
  this.buildUi();
  this.initEvents();
};

// inherit from silex.view.PaneBase
goog.inherits(silex.view.pane.BorderPane, silex.view.pane.PaneBase);


/**
 * input element
 */
silex.view.pane.BorderPane.prototype.borderWidthInput = null;


/**
 * input element
 */
silex.view.pane.BorderPane.prototype.borderStyleComboBox = null;


/**
 * input element
 */
silex.view.pane.BorderPane.prototype.borderPlacementCheckBoxes = null;


/**
 * input element
 */
silex.view.pane.BorderPane.prototype.borderRadiusInput = null;


/**
 * input element
 */
silex.view.pane.BorderPane.prototype.cornerPlacementCheckBoxes = null;


/**
 * color picker for border color
 */
silex.view.pane.BorderPane.prototype.borderColorPicker = null;


/**
 * color picker for border color
 */
silex.view.pane.BorderPane.prototype.hsvPalette = null;


/**
 * build the UI
 */
silex.view.pane.BorderPane.prototype.buildUi = function() {
  // border width
  this.borderWidthInput = goog.dom.getElementByClass(
      'border-width-input',
      this.element);

  // border style
  this.borderStyleComboBox = goog.ui.decorate(
      goog.dom.getElementByClass(
        'border-type-combo-box',
        this.element));

  // border color
  var hsvPaletteElement = goog.dom.getElementByClass(
      'border-color-palette',
      this.element);
  this.hsvPalette = new goog.ui.HsvPalette(
      undefined,
      undefined,
      'goog-hsv-palette-sm');
  this.hsvPalette.render(hsvPaletteElement);

  // init button which shows/hides the palete
  this.colorPicker = new goog.ui.ColorButton('');
  this.colorPicker.setTooltip('Click to select color');
  this.colorPicker.render(
      goog.dom.getElementByClass('border-color-button',
      this.element));

  // init palette
  this.hsvPalette.setColor('#000000');
  this.setColorPaletteVisibility(this.hsvPalette, false);

  // border placement
  this.borderPlacementCheckBoxes = this.createCheckBoxes(
      'border-placement-container',
      this.onBorderWidthChanged);

  // corner radius
  this.borderRadiusInput = goog.dom.getElementByClass(
      'corner-radius-input',
      this.element);

  // corner placement
  this.cornerPlacementCheckBoxes = this.createCheckBoxes(
      'corner-placement-container',
      this.onBorderCornerChanged);
};


/**
 * attach events
 * called by the constructor
 */
silex.view.pane.BorderPane.prototype.initEvents = function() {
  goog.events.listen(this.borderWidthInput,
      goog.events.EventType.INPUT,
      this.onBorderWidthChanged,
      false,
      this);
  goog.events.listen(this.borderStyleComboBox,
      goog.ui.Component.EventType.CHANGE,
      this.onBorderStyleChanged,
      false,
      this);
  goog.events.listen(this.hsvPalette,
      goog.ui.Component.EventType.ACTION,
      this.onBorderColorChanged,
      false,
      this);
  goog.events.listen(this.colorPicker,
      goog.ui.Component.EventType.ACTION,
      this.toggleColorPaletteVisibility,
      false,
      this);
  goog.events.listen(this.borderRadiusInput,
      goog.events.EventType.INPUT,
      this.onBorderCornerChanged,
      false,
      this);
}


/**
 * create and return checkboxes
 * decorate the HTML nodes
 * attach change event
 */
silex.view.pane.BorderPane.prototype.createCheckBoxes =
  function(containersCssClass, onChanged) {
  var checkBoxes = [];
  var decorateNodes = goog.dom.getElementsByTagNameAndClass('span',
      undefined,
      goog.dom.getElementByClass(containersCssClass,
      this.element));
  var idx;
  var len = decorateNodes.length;
  for (idx = 0; idx < len; idx++) {
    var checkBox = goog.ui.decorate(decorateNodes[idx]);
    checkBoxes.push(checkBox);
    goog.events.listen(checkBox,
                       goog.ui.Component.EventType.CHANGE,
                       onChanged,
                       false,
                       this);
  }
  return checkBoxes;
};


/**
 * redraw the properties
 */
silex.view.pane.BorderPane.prototype.redraw =
  function(selectedElements, document, pageNames, currentPageName) {
  if (this.iAmSettingValue) return;
  this.iAmRedrawing = true;
  // call super
  goog.base(
      this,
      'redraw',
      selectedElements,
      document,
      pageNames,
      currentPageName);

  // border width
  var borderWidth = this.getCommonProperty(
      selectedElements,
      goog.bind(function(element) {
        return this.model.element.getStyle(element, 'borderWidth');
  }, this));
  if (borderWidth) {
    this.redrawBorderWidth(borderWidth);
    // border color
    var borderColor = this.getCommonProperty(
        selectedElements,
        goog.bind(function(element) {
          return this.model.element.getStyle(element, 'borderColor');
    }, this));
    this.redrawBorderColor(borderColor);
  }
  else {
    this.resetBorder();
  }
  // border style
  var borderStyle = this.getCommonProperty(
      selectedElements,
      goog.bind(function(element) {
        return this.model.element.getStyle(element, 'borderStyle');
  }, this));
  if (borderStyle) {
    this.borderStyleComboBox.setValue(borderStyle);
  }
  else {
    this.borderStyleComboBox.setSelectedIndex(0);
  }
  // border radius
  var borderRadius = this.getCommonProperty(
      selectedElements,
      goog.bind(function(element) {
        return this.model.element.getStyle(element, 'borderRadius');
  }, this));
  if (borderRadius) {
    this.redrawBorderRadius(borderRadius);
  }
  else {
    this.resetBorderRadius();
  }
  this.iAmRedrawing = false;
};


/**
 * redraw border radius UI
 */
silex.view.pane.BorderPane.prototype.redrawBorderRadius =
    function(borderRadius) {
  var values = borderRadius.split(' ');
  // The four values for each radii are given in the order
  // top-left, top-right, bottom-right, bottom-left.
  // If top-right is omitted it is the same as top-left.
  if (!goog.isDef(values[1])) values[1] = values[0];
  // If bottom-right is omitted it is the same as top-left.
  if (!goog.isDef(values[2])) values[2] = values[0];
  // If bottom-left is omitted it is the same as top-right.
  if (!goog.isDef(values[3])) values[3] = values[1];
  // get corner radius value
  var val = values[0];
  if (goog.isDef(values[1]) && val === '0' || val === '0px') val = values[1];
  if (goog.isDef(values[2]) && val === '0' || val === '0px') val = values[2];
  if (goog.isDef(values[3]) && val === '0' || val === '0px') val = values[3];
  // remove unit when needed
  if (goog.isDef(val) && val !== '0' && val !== '0px') {
    this.borderRadiusInput.value = val.substr(0, val.indexOf('px'));
    // corner placement
    var idx;
    var len = this.cornerPlacementCheckBoxes.length;
    for (idx = 0; idx < len; idx++) {
      var checkBox = this.cornerPlacementCheckBoxes[idx];
      if (values[idx] !== '0' && values[idx] !== '0px')
        checkBox.setChecked(true);
      else
        checkBox.setChecked(false);
    }
  }
  else {
    this.resetBorderRadius();
  }
};


/**
 * redraw border color UI
 */
silex.view.pane.BorderPane.prototype.redrawBorderColor =
    function(borderColorStr) {
  if (borderColorStr === 'transparent' || borderColorStr === '') {
    this.setColorPaletteVisibility(this.hsvPalette, false);
  }
  else if (goog.isNull(borderColorStr)) {
    // display a "no color" in the button
    this.colorPicker.setValue('#000000');
  }
  else {
    // handle all colors, including the named colors
    var borderColor = goog.color.parse(borderColorStr);

    this.colorPicker.setValue(borderColor.hex);
    this.hsvPalette.setColor(borderColor.hex);
  }
};


/**
 * redraw border width UI
 */
silex.view.pane.BorderPane.prototype.redrawBorderWidth = function(borderWidth) {
  this.colorPicker.setEnabled(true);
  // top, right, bottom, left
  var values = borderWidth.split(' ');
  // One-value syntax - width
  if (values.length === 1) {
    values[1] = values[2] = values[3] = values[0];
  }
  // Two-value syntax - horizontal vertical
  else if (values.length === 2) {
    values[2] = values[0];
    values[3] = values[1];
  }
  // Three-value syntax - top vertical bottom
  else if (values.length === 3) {
    values[3] = values[1];
  }
  // Four-value syntax - top right bottom left
  // else if (values.length  === 4) {
  // do nothing, we're good!
  // }
  var val = values[0];
  if (goog.isDef(values[1]) && val === '0' || val === '0px') val = values[1];
  if (goog.isDef(values[2]) && val === '0' || val === '0px') val = values[2];
  if (goog.isDef(values[3]) && val === '0' || val === '0px') val = values[3];
  if (goog.isDef(val) && val !== '0' && val !== '0px') {
    this.borderWidthInput.value = val.substr(0, val.indexOf('px'));
    // border placement
    var idx;
    var len = this.borderPlacementCheckBoxes.length;
    for (idx = 0; idx < len; idx++) {
      var checkBox = this.borderPlacementCheckBoxes[idx];
      if (values.length > idx && values[idx] !== '0' && values[idx] !== '0px')
        checkBox.setChecked(true);
      else
        checkBox.setChecked(false);
    }
  }
  else {
    this.resetBorder();
  }
};


/**
 * reset UI
 */
silex.view.pane.BorderPane.prototype.resetBorderRadius = function() {
  this.borderRadiusInput.value = '';
  // corner placement
  var idx;
  var len = this.cornerPlacementCheckBoxes.length;
  for (idx = 0; idx < len; idx++) {
    var checkBox = this.cornerPlacementCheckBoxes[idx];
    checkBox.setChecked(true);
  }
};


/**
 * reset UI
 */
silex.view.pane.BorderPane.prototype.resetBorder = function() {
  this.borderWidthInput.value = '';
  // border placement
  var idx;
  var len = this.borderPlacementCheckBoxes.length;
  for (idx = 0; idx < len; idx++) {
    var checkBox = this.borderPlacementCheckBoxes[idx];
    checkBox.setChecked(true);
  }
  // border color
  this.colorPicker.setValue('#000000');
  this.hsvPalette.setColor('#000000');
  this.setColorPaletteVisibility(this.hsvPalette, false);
  this.colorPicker.setEnabled(false);
};


/**
 * property changed
 * callback for number inputs
 */
silex.view.pane.BorderPane.prototype.onBorderWidthChanged = function() {
  if (this.borderWidthInput.value &&
      this.borderWidthInput.value !== '' &&
      this.borderWidthInput.value !== '0') {
    // border color
    this.colorPicker.setEnabled(true);
    // border placement
    var borderWidthStr = '';
    var idx;
    var len = this.borderPlacementCheckBoxes.length;
    for (idx = 0; idx < len; idx++) {
      var checkBox = this.borderPlacementCheckBoxes[idx];
      if (checkBox.getChecked()) {
        borderWidthStr += this.borderWidthInput.value + 'px ';
      }
      else {
        borderWidthStr += '0 ';
      }
    }
    // border width
    this.styleChanged('borderWidth', borderWidthStr);
    // border style
    this.onBorderStyleChanged();
  }
  else {
    this.styleChanged('borderWidth', '');
    this.styleChanged('borderStyle', '');
    this.colorPicker.setEnabled(false);
  }
};


/**
 * property changed
 * callback for number inputs
 * border style
 */
silex.view.pane.BorderPane.prototype.onBorderStyleChanged = function() {
  // prevent changing border when redraw is setting the value
  if(this.iAmRedrawing) return;

  this.styleChanged(
      'borderStyle',
      this.borderStyleComboBox.getSelectedItem().getValue());
};


/**
 * property changed
 * callback for number inputs
 */
silex.view.pane.BorderPane.prototype.onBorderColorChanged = function() {
  var hex = this.hsvPalette.getColor();
  this.styleChanged('borderColor', hex);
  this.colorPicker.setValue(hex);
};


/**
 * property changed
 * callback for number inputs
 */
silex.view.pane.BorderPane.prototype.onBorderCornerChanged = function() {
  // corner radius
  if (goog.isDef(this.borderRadiusInput.value) &&
      this.borderRadiusInput.value !== '') {
    // corner placement
    var borderWidthStr = '';
    var idx;
    var len = this.cornerPlacementCheckBoxes.length;
    for (idx = 0; idx < len; idx++) {
      var checkBox = this.cornerPlacementCheckBoxes[idx];
      if (checkBox.getChecked()) {
        borderWidthStr += this.borderRadiusInput.value + 'px ';
      }
      else {
        borderWidthStr += '0 ';
      }
    }
    this.styleChanged('borderRadius', borderWidthStr);
  }
  else {
    this.styleChanged('borderRadius', '');
  }
};


/**
 * reset borders
 *
silex.view.pane.BorderPane.prototype.onResetBorder = function() {
  this.borderWidthInput.value = '';
  this.onBorderWidthChanged();
};
/* */


/**
 * color palette visibility
 */
silex.view.pane.BorderPane.prototype.toggleColorPaletteVisibility = function() {
  this.setColorPaletteVisibility(this.hsvPalette, !this.getColorPaletteVisibility(this.hsvPalette));
};

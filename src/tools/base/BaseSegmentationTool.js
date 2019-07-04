import external from './../../externalModules.js';
import BaseTool from './BaseTool.js';
import store from './../../store/index.js';

const { state, setters } = store.modules.brush;

/**
 * @abstract
 * @memberof Tools.Base
 * @classdesc Abstract class for tools which manipulate the mask data to be displayed on
 * the cornerstone canvas.
 * @extends Tools.Base.BaseTool
 */
class BaseSegmentationTool extends BaseTool {
  constructor(props, defaultProps = {}) {
    if (!defaultProps.configuration) {
      defaultProps.configuration = { alwaysEraseOnClick: false };
    }
    defaultProps.configuration.referencedToolData = 'segmentation';

    super(props, defaultProps);
  }

  // ===================================================================
  // Abstract Methods - Must be implemented.
  // ===================================================================

  /**
   * Used to redraw the tool's annotation data per render.
   *
   * @override
   * @param {Object} evt - The event.
   */
  renderToolData(evt) {
    throw new Error(`Method renderToolData not implemented for ${this.name}.`);
  }

  // ===================================================================
  // Virtual Methods - Have default behavior but may be overridden.
  // ===================================================================

  // ===================================================================
  // Segmentation API. This is effectively a wrapper around the store.
  // ===================================================================

  /**
   * Switches to the next segment color.
   *
   * @public
   * @api
   * @returns {void}
   */
  nextSegment() {
    setters.incrementActiveSegmentIndex(this.element);
  }

  /**
   * Switches to the previous segmentation color.
   *
   * @public
   * @api
   * @returns {void}
   */
  previousSegment() {
    setters.decrementActiveSegmentIndex(this.element);
  }

  get alpha() {
    return state.alpha;
  }

  set alpha(value) {
    const enabledElement = this._getEnabledElement();

    state.alpha = value;
    external.cornerstone.updateImage(enabledElement.element);
  }

  get alphaOfInactiveLabelmap() {
    return state.alphaOfInactiveLabelmap;
  }

  set alphaOfInactiveLabelmap(value) {
    const enabledElement = this._getEnabledElement();

    state.alphaOfInactiveLabelmap = value;
    external.cornerstone.updateImage(enabledElement.element);
  }

  _getEnabledElement() {
    return external.cornerstone.getEnabledElement(this.element);
  }

  /**
   * Returns the toolData type associated with this type of tool.
   *
   * @static
   * @public
   * @returns {String} The number of colors in the color map.
   */
  static getReferencedToolDataName() {
    return 'segmentation';
  }
}

export default BaseSegmentationTool;

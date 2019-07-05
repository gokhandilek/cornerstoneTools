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
class BaseSegmentationAPI extends BaseTool {
  constructor(props, defaultProps = {}) {
    super(props, defaultProps);
  }

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
}

export default BaseSegmentationAPI;

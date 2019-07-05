import BaseSegmentationAPI from './BaseSegmentationAPI';

class BaseSegmentationEvents extends BaseSegmentationAPI {
  constructor(props, defaultProps = {}) {
    super(props, defaultProps);

    //
    // Touch
    //
    /** @inheritdoc */
    this.postTouchStartCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.touchDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.touchEndCallback = this._applyStrategy.bind(this);

    //
    // MOUSE
    //
    /** @inheritdoc */
    this.postMouseDownCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseClickCallback = this._startOutliningRegion.bind(this);

    /** @inheritdoc */
    this.mouseDragCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseMoveCallback = this._setHandlesAndUpdate.bind(this);

    /** @inheritdoc */
    this.mouseUpCallback = this._applyStrategy.bind(this);

    this._resetHandles();
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
  // eslint-disable-next-line no-unused-vars
  renderToolData(evt) {
    throw new Error(`Method renderToolData not implemented for ${this.name}.`);
  }

  /**
   * Sets the start handle point and claims the eventDispatcher event
   *
   * @abstract
   * @param {Object} evt - The event.
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  _startOutliningRegion(evt) {
    throw new Error(
      `Method _startOutliningRegion not implemented for ${this.name}.`
    );
  }

  /**
   * This function will update the handles and updateImage to force re-draw
   *
   * @abstract
   * @param {Object} evt - The event.
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  _setHandlesAndUpdate(evt) {
    throw new Error(
      `Method _setHandlesAndUpdate not implemented for ${this.name}.`
    );
  }

  /**
   * Event handler for MOUSE_UP/TOUCH_END during handle drag event loop.
   *
   * @abstract
   * @param {Object} evt - The event.
   * @returns {void}
   */
  // eslint-disable-next-line no-unused-vars
  _applyStrategy(evt) {
    throw new Error(`Method _applyStrategy not implemented for ${this.name}.`);
  }

  /**
   * Sets the start and end handle points to empty objects
   *
   * @abstract
   * @returns {void}
   */
  _resetHandles() {
    throw new Error(`Method _resetHandles not implemented for ${this.name}.`);
  }
}

export default BaseSegmentationEvents;

import BaseSegmentationTool from '../BaseSegmentationTool';
import toolColors from '../../../stateManagement/toolColors';
import { draw, drawRect, getNewContext } from '../../../drawing';

import external from '../../../externalModules';
import _isEmptyObject from './../../../util/isEmptyObject';

import store from '../../../store';

const brushModule = store.modules.brush;
const { getters } = brushModule;

class BaseRectangleSegmentationTool extends BaseSegmentationTool {
  constructor(props, defaultProps = {}) {
    super(props, defaultProps);
  }

  /**
   * Render hook: draws the Scissors's outline, box, or circle
   *
   * @param {Object} evt Cornerstone.event#cornerstoneimagerendered > cornerstoneimagerendered event
   * @memberof Tools.ScissorsTool
   * @returns {void}
   */
  renderToolData(evt) {
    const eventData = evt.detail;
    const { element } = eventData;
    const color = toolColors.getColorIfActive({ active: true });
    const context = getNewContext(eventData.canvasContext.canvas);

    draw(context, context => {
      drawRect(context, element, this.handles.start, this.handles.end, {
        color,
      });
    });
  }

  /**
   * Sets the start handle point and claims the eventDispatcher event
   *
   * @private
   * @param {*} evt // mousedown, touchstart, click
   * @returns {Boolean} True
   */
  _startOutliningRegion(evt) {
    const consumeEvent = true;
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;

    if (_isEmptyObject(this.handles.start)) {
      this.handles.start = image;
    } else {
      this.handles.end = image;
      this._applyStrategy(evt);
    }

    external.cornerstone.updateImage(element);

    return consumeEvent;
  }

  /**
   * This function will update the handles and updateImage to force re-draw
   *
   * @private
   * @method _setHandlesAndUpdate
   * @param {(CornerstoneTools.event#TOUCH_DRAG|CornerstoneTools.event#MOUSE_DRAG|CornerstoneTools.event#MOUSE_MOVE)} evt  Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _setHandlesAndUpdate(evt) {
    const {
      element,
      currentPoints: { image },
    } = evt.detail;

    this.handles.end = image;
    external.cornerstone.updateImage(element);
  }

  /**
   * Event handler for MOUSE_UP/TOUCH_END during handle drag event loop.
   *
   * @private
   * @method _applyStrategy
   * @param {(CornerstoneTools.event#MOUSE_UP|CornerstoneTools.event#TOUCH_END)} evt Interaction event emitted by an enabledElement
   * @returns {void}
   */
  _applyStrategy(evt) {
    evt.detail.handles = this.handles;

    const points = [
      {
        x: this.handles.start.x,
        y: this.handles.start.y,
      },
      {
        x: this.handles.end.x,
        y: this.handles.end.y,
      },
    ];
    const { image, element } = evt.detail;

    const {
      labelmap3D,
      currentImageIdIndex,
      activeLabelmapIndex,
    } = getters.getAndCacheLabelmap2D(element);

    const toolData = getters.labelmapBuffers(element, activeLabelmapIndex);

    const arrayLength = image.width * image.height * 2;
    const segmentationData = new Uint16Array(toolData.buffer, 0, arrayLength);

    evt.detail.handles = this.handles;
    evt.OperationData = {
      points,
      segmentationData,
      image,
    };

    this.applyActiveStrategy(evt);

    // TODO: Future: 3D propagation (unlimited, positive, negative, symmetric)

    // Invalidate the brush tool data so it is redrawn
    labelmap3D.labelmaps2D[currentImageIdIndex].invalidated = true;
    external.cornerstone.updateImage(element);

    this._resetHandles();
  }

  /**
   * Sets the start and end handle points to empty objects
   *
   * @private
   * @method _resetHandles
   * @returns {undefined}
   */
  _resetHandles() {
    this.handles = {
      start: {},
      end: {},
    };
  }
}

export default BaseRectangleSegmentationTool;

import external from '../../externalModules.js';
import BaseBrushTool from '../base/BaseBrushTool.js';
import { setToolCursor } from '../../store/setToolCursor.js';

// Drawing
import { draw, drawJoinedLines, getNewContext } from '../../drawing';
import toolColors from '../../stateManagement/toolColors.js';

import {
  scissorsFillInsideCursor,
  scissorsEraseInsideCursor,
  scissorsEraseOutsideCursor,
  scissorsFillOutsideCursor,
} from '../cursors';

import { modules } from '../../store';
import { fillInside, fillOutside } from './utils';

/**
 * @public
 * @class ScissorsTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data
 * @extends Tools.Base.BaseTool
 */
export default class ScissorsTool extends BaseBrushTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'Scissors',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: scissorsFillInsideCursor,
    };

    super(props, defaultProps);

    this._resetHandles();

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

    this._changeOperation = this._changeOperation.bind(this);
    this._changeOperation();
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
    const handles = this.handles;

    draw(context, context => {
      if (handles.points.length > 1) {
        for (let j = 0; j < handles.points.length; j++) {
          const lines = [...handles.points[j].lines];
          const points = handles.points;

          if (j === points.length - 1) {
            // If it's still being actively drawn, keep the last line to
            // The mouse location
            lines.push(this.handles.points[0]);
          }
          drawJoinedLines(
            context,
            element,
            this.handles.points[j],
            lines,
            color
          );
        }
      }
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
    this._startOutliningRegionForScissors(evt);
    this._startOutliningRegionForScissors = this._startOutliningRegionForScissors.bind(
      this
    );
  }

  _startOutliningRegionForScissors(evt) {
    const consumeEvent = true;
    const element = evt.detail.element;
    const image = evt.detail.currentPoints.image;
    const emptyPoints = !this.handles.points.length;

    if (emptyPoints) {
      this.handles.points.push({
        x: image.x,
        y: image.y,
        lines: [],
      });
      this.currentHandle += 1;
    } else {
      this.handles.points.push({
        x: image.x,
        y: image.y,
        lines: [],
      });
      this.currentHandle += 1;
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
    const eventData = evt.detail;
    const element = evt.detail.element;

    this._addPointPencilMode(eventData, this.handles.points);
    external.cornerstone.updateImage(element);
  }

  /**
   * Function responsible for changing the Cursor, according to the strategy
   * @param {HTMLElement} element
   * @param {string} operation The strategy to be used on Tool
   * @private
   * @returns {void}
   */
  _changeCursor(element, operation) {
    // Necessary to avoid setToolCursor without elements, what throws an error
    if (!this.element) {
      return;
    }

    const cursorList = {
      FILL_INSIDE: scissorsFillInsideCursor,
      FILL_OUTSIDE: scissorsFillOutsideCursor,
      ERASE_OUTSIDE: scissorsEraseOutsideCursor,
      ERASE_INSIDE: scissorsEraseInsideCursor,
      default: scissorsFillInsideCursor,
    };

    const newCursor = cursorList[operation] || cursorList.default;

    setToolCursor(element, newCursor);
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
    const { element } = evt.detail;

    evt.detail.handles = this.handles;

    _applySegmentationChanges(evt, this, this.handles.points);

    this._resetHandles();
    external.cornerstone.updateImage(element);
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
      points: [],
    };

    this.currentHandle = 0;
  }

  /**
   * If in pencilMode, check the mouse position is farther than the minimum
   * distance between points, then add a point.
   *
   * @private
   * @param {Object} eventData - Data object associated with an event.
   * @param {Object} points - Data object associated with the tool.
   * @returns {undefined}
   */
  _addPointPencilMode(eventData, points) {
    this._addPoint(eventData);
  }

  /**
   * Adds a point on mouse click in polygon mode.
   *
   * @private
   * @param {Object} eventData - data object associated with an event.
   * @returns {undefined}
   */
  _addPoint(eventData) {
    const config = this.configuration;

    // If this is not the first handle
    if (this.handles.points.length) {
      // Add the line from the current handle to the new handle
      this.handles.points[this.currentHandle - 1].lines.push({
        x: eventData.currentPoints.image.x,
        y: eventData.currentPoints.image.y,
        lines: [],
      });
    }

    // Add the new handle
    this.handles.points.push({
      x: eventData.currentPoints.image.x,
      y: eventData.currentPoints.image.y,
      lines: [],
    });

    // Increment the current handle value
    this.currentHandle += 1;

    // Force onImageRendered to fire
    external.cornerstone.updateImage(eventData.element);
  }

  /**
   * Change Operation Method
   * @param { string } operation
   * @private
   * @returns {void}
   */
  _changeOperation(operation = 'FILL_INSIDE') {
    this.configuration = { operation };
    this._changeCursor(this.element, operation);
    this._resetHandles();
  }

  /**
   * Fake Override asked by BaseBrushTool
   * @returns {void}
   * @private
   */
  _paint() {}

  /**
   * Fake Override asked by BaseBrushTool
   * @returns {void}
   * @private
   */
  renderBrush() {}
}

function _applySegmentationChanges(evt, toolInstance, points) {
  const config = toolInstance.configuration;
  const eventData = evt.detail;
  const { image, element } = eventData;
  const brushModule = modules.brush;
  const activeLabelmapIndex = 0; // TODO: Hardcoded for now, only works on first labelmap!
  const toolData = brushModule.getters.labelmapBuffers(
    element,
    activeLabelmapIndex
  );

  // TODO: This is only reading from the first image in the volume for now
  const arrayLength = image.width * image.height * 2;
  const segmentationData = new Uint16Array(toolData.buffer, 0, arrayLength);

  // TODO: Hardcoded! Only sets a value of 1 in the labelmap
  const labelValue = 1;

  switch (config.operation) {
    case 'FILL_INSIDE':
    default:
      fillInside(points, segmentationData, image, labelValue);
      break;
    case 'FILL_OUTSIDE':
      fillOutside(points, segmentationData, image, labelValue);
      break;
    case 'ERASE_OUTSIDE':
      fillOutside(points, segmentationData, image, 0);
      break;
    case 'ERASE_INSIDE':
      fillInside(points, segmentationData, image, 0);
      break;
  }

  // TODO: Future: 3D propagation (unlimited, positive, negative, symmetric)

  // Invalidate the brush tool data so it is redrawn
  brushModule.setters.invalidateBrushOnEnabledElement(
    element,
    activeLabelmapIndex
  );
}
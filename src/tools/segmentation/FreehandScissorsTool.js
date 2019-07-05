import external from '../../externalModules.js';
import { BaseFreehandSegmentationTool } from '../base/segmentation';
import { setToolCursor } from '../../store/setToolCursor.js';

import {
  scissorsFillInsideCursor,
  scissorsEraseInsideCursor,
  scissorsEraseOutsideCursor,
  scissorsFillOutsideCursor,
} from '../cursors';

import { fillInside, fillOutside } from '../../util/segmentation';

/**
 * @public
 * @class FreehandScissorsTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data
 * @extends Tools.Base.BaseSegmentationTool
 */
export default class FreehandScissorsTool extends BaseFreehandSegmentationTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'FreehandScissors',
      configuration: {
        referencedToolData: 'brush',
      },
      strategies: {
        FILL_INSIDE: _fillInsideStrategy,
        FILL_OUTSIDE: _fillOutsideStrategy,
        ERASE_OUTSIDE: _eraseOutsideStrategy,
        ERASE_INSIDE: _eraseInsideStrategy,
        default: _fillInsideStrategy,
      },
      defaultStrategy: 'default',
      supportedInteractionTypes: ['Mouse', 'Touch'],
      svgCursor: scissorsFillInsideCursor,
    };

    super(props, defaultProps);

    this._changeStrategy = this._changeStrategy.bind(this);
    this._changeStrategy();
  }

  /**
   * Function responsible for changing the Cursor, according to the strategy
   * @param {HTMLElement} element
   * @param {string} strategy The strategy to be used on Tool
   * @private
   * @returns {void}
   */
  _changeCursor(element, strategy) {
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

    const newCursor = cursorList[strategy] || cursorList.default;

    setToolCursor(element, newCursor);
    external.cornerstone.updateImage(element);
  }

  /**
   * Adds a point on mouse click in polygon mode.
   *
   * @private
   * @param {Object} eventData - data object associated with an event.
   * @returns {undefined}
   */
  _addPoint(eventData) {
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
   * Change Strategy Method
   * @param { string } strategy
   * @private
   * @returns {void}
   */
  _changeStrategy(strategy = 'default') {
    this.setActiveStrategy(strategy);
    this._changeCursor(this.element, strategy);
    this._resetHandles();
  }
}

function _fillInsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;

  fillInside(points, segmentationData, image, 1);
}

function _fillOutsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;

  fillOutside(points, segmentationData, image, 1);
}

function _eraseOutsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;

  fillOutside(points, segmentationData, image, 0);
}

function _eraseInsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;

  fillInside(points, segmentationData, image, 0);
}

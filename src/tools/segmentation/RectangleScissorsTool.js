import { BaseRectangleSegmentationTool } from '../base';
import {
  fillInsideBoundingBox,
  fillOutsideBoundingBox,
} from '../../util/segmentation/Operations';
import { getBoundingBoxAroundPolygon } from '../../util/segmentation';
import external from '../../externalModules';
import { setToolCursor } from '../../store/setToolCursor';

// Cursors
import {
  scissorsRectangleEraseInsideCursor,
  scissorsRectangleEraseOutsideCursor,
  scissorsRectangleFillInsideCursor,
  scissorsRectangleFillOutsideCursor,
} from '../cursors';

/**
 * @public
 * @class RectangleScissorsTool
 * @memberof Tools
 * @classdesc Tool for slicing brush pixel data within a rectangle shape
 * @extends Tools.Base.BaseSegmentationTool
 */
export default class RectangleScissorsTool extends BaseRectangleSegmentationTool {
  /** @inheritdoc */
  constructor(props = {}) {
    const defaultProps = {
      name: 'RectangleScissors',
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
      svgCursor: scissorsRectangleFillInsideCursor,
    };

    super(props, defaultProps);
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
      FILL_INSIDE: scissorsRectangleFillInsideCursor,
      FILL_OUTSIDE: scissorsRectangleFillOutsideCursor,
      ERASE_OUTSIDE: scissorsRectangleEraseOutsideCursor,
      ERASE_INSIDE: scissorsRectangleEraseInsideCursor,
      default: scissorsRectangleFillInsideCursor,
    };

    const newCursor = cursorList[strategy] || cursorList.default;

    setToolCursor(element, newCursor);
    external.cornerstone.updateImage(element);
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

  fillInsideBoundingBox(points, segmentationData, image, 1);
}

function _fillOutsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, image, 1);
}

function _eraseOutsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;
  const vertices = points.map(a => [a.x, a.y]);
  const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(vertices, image);

  fillOutsideBoundingBox(topLeft, bottomRight, segmentationData, image, 0);
}

function _eraseInsideStrategy(evt) {
  const { points, segmentationData, image } = evt.OperationData;

  fillInsideBoundingBox(points, segmentationData, image, 0);
}

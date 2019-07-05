import {
  freehandEraseInsideCursor,
  freehandEraseOutsideCursor,
  freehandFillInsideCursor,
  freehandFillOutsideCursor,
  segCircleEraseInsideCursor,
  segCircleEraseOutsideCursor,
  segCircleFillInsideCursor,
  segCircleFillOutsideCursor,
  segRectangleEraseInsideCursor,
  segRectangleEraseOutsideCursor,
  segRectangleFillInsideCursor,
  segRectangleFillOutsideCursor,
} from '../../tools/cursors';

const cursorList = {
  FreehandScissors: {
    FILL_INSIDE: freehandFillInsideCursor,
    FILL_OUTSIDE: freehandFillOutsideCursor,
    ERASE_OUTSIDE: freehandEraseOutsideCursor,
    ERASE_INSIDE: freehandEraseInsideCursor,
    default: freehandFillInsideCursor,
  },
  RectangleScissors: {
    FILL_INSIDE: segRectangleFillInsideCursor,
    FILL_OUTSIDE: segRectangleEraseOutsideCursor,
    ERASE_OUTSIDE: segRectangleFillOutsideCursor,
    ERASE_INSIDE: segRectangleEraseInsideCursor,
    default: segRectangleFillInsideCursor,
  },
  CircleScissors: {
    FILL_INSIDE: segCircleFillInsideCursor,
    FILL_OUTSIDE: segCircleFillOutsideCursor,
    ERASE_OUTSIDE: segCircleEraseOutsideCursor,
    ERASE_INSIDE: segCircleEraseInsideCursor,
    default: segCircleFillInsideCursor,
  },
};

const getCursor = (tool, strategy) =>
  cursorList[tool][strategy] || cursorList[0][0];

export default getCursor;

import {
  fillInside,
  fillInsideBoundingBox,
  fillOutside,
  fillOutsideBoundingBox,
} from './index';
import { getBoundingBoxAroundPolygon } from '../Boundaries';

export default (tool, strategy, evt) => {
  const { points, segmentationData, image } = evt.OperationData;
  const operationList = {
    Circle: {
      FILL_INSIDE: () => {},
      FILL_OUTSIDE: () => {},
      ERASE_OUTSIDE: () => {},
      ERASE_INSIDE: () => {},
      default: () => {},
    },
    Freehand: {
      FILL_INSIDE: () => {
        fillInside(points, segmentationData, image, 1);
      },
      FILL_OUTSIDE: () => {
        fillOutside(points, segmentationData, image, 1);
      },
      ERASE_OUTSIDE: () => {
        fillOutside(points, segmentationData, image, 0);
      },
      ERASE_INSIDE: () => {
        fillInside(points, segmentationData, image, 0);
      },
      default: () => {
        fillInside(points, segmentationData, image, 1);
      },
    },
    Rectangle: {
      FILL_INSIDE: () => {
        fillInsideBoundingBox(points, segmentationData, image, 1);
      },
      FILL_OUTSIDE: () => {
        const vertices = points.map(a => [a.x, a.y]);
        const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(
          vertices,
          image
        );

        fillOutsideBoundingBox(
          topLeft,
          bottomRight,
          segmentationData,
          image,
          1
        );
      },
      ERASE_OUTSIDE: () => {
        const { points, segmentationData, image } = evt.OperationData;
        const vertices = points.map(a => [a.x, a.y]);
        const [topLeft, bottomRight] = getBoundingBoxAroundPolygon(
          vertices,
          image
        );

        fillOutsideBoundingBox(
          topLeft,
          bottomRight,
          segmentationData,
          image,
          0
        );
      },
      ERASE_INSIDE: () => {
        const { points, segmentationData, image } = evt.OperationData;

        fillInsideBoundingBox(points, segmentationData, image, 0);
      },
      default: () => {
        fillInsideBoundingBox(points, segmentationData, image, 1);
      },
    },
  };

  return operationList[tool][strategy]() || null;
};

export default function getBoundingBoxAroundPolygon(vertices, image) {
  let xMin = Infinity;
  let xMax = 0;
  let yMin = Infinity;
  let yMax = 0;
  const { width, height } = image;

  vertices.forEach(v => {
    xMin = Math.min(v[0], xMin);
    xMax = Math.max(v[0], xMax);
    yMin = Math.min(v[1], yMin);
    yMax = Math.max(v[1], yMax);
  });

  xMin = Math.round(xMin);
  yMin = Math.round(yMin);
  xMax = Math.round(xMax);
  yMax = Math.round(yMax);

  xMax = xMax > width ? width : xMax;
  xMin = xMin < 0 ? 0 : xMin;

  yMax = yMax > height ? height : yMax;
  yMin = yMin < 0 ? 0 : yMin;

  return [[xMin, yMin], [xMax, yMax]];
}

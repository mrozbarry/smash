import * as vec from './vector2d';

export const make = (center, size) => ({
  center,
  halfSize: vec.multiply(0.5, size),
});

export const fromRect = (rect) => make(
  vec.make(rect.x + (rect.width / 2), rect.y + (rect.height / 2)),
  vec.make(rect.width, rect.height),
);

export const hasOverlap = (a, b) => {
  const outsideX = Math.abs(a.center.x - b.center.x) > a.halfSize.x + b.halfSize.x;
  const outsideY = Math.abs(a.center.y - b.center.y) > a.halfSize.y + b.halfSize.y;
  return !outsideX && !outsideY;
};

import * as vec from './vector2d'

export const make = (position, size) => ({
  ...position,
  width: size.x,
  height: size.y,
});

export const expand = (expandX, expandY, rect) => make(
  vec.make(
    rect.x - (expandX / 2),
    rect.y - (expandY / 2),
  ),
  vec.make(
    rect.width + expandX,
    rect.height + expandY,
  ),
);

export const fromAabb = (aabb) => make(
  vec.add(aabb.center, vec.multiply(-1, aabb.halfSize)),
  vec.multiply(2, aabb.halfSize),
);

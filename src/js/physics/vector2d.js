export const make = (x = 0, y = 0) => ({
  x,
  y,
});

export const zero = make();

export const copy = (other) => make(
  other.x,
  other.y,
);

export const multiply = (value, vec) => make(
  vec.x * value,
  vec.y * value,
);

export const multiplyAxis = (mulVec, vec) => make(
  vec.x * mulVec.x,
  vec.y * mulVec.y,
);

export const add = (other, vec) => make(
  vec.x + other.x,
  vec.y + other.y,
);

export const clamp = (min, max, vec) => make(
  Math.max(min.x, Math.min(max.x, vec.x)),
  Math.max(min.y, Math.min(max.y, vec.y)),
);

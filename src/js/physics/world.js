import * as vec from './vector2d';

export const make = (gravity, timestep, geometry = []) => ({
  gravity,
  timestep,
  geometry,
  lastFrameTime: 0,
  accumulator: 0,
  gameTime: 0,
});

export const setAccumulator = (accumulator, world) => ({
  ...world,
  accumulator,
});

export const detectClosestPlatform = (position, size, world) => {
  const halfWidth = size.x / 2;
  const x1 = position.x - halfWidth;
  const x2 = position.x + halfWidth;

  return world.geometry
    .filter(rect => (
      (
        (rect.x <= x1 && (rect.x + rect.width) >= x1)
        && rect.y >= position.y
      ) || (
        (rect.x <= x2 && (rect.x + rect.width) >= x2)
        && rect.y >= position.y
      )
    ))
    .sort((a, b) => a.y - b.y)[0];
};

export const applyDelta = (delta, world) => ({
  ...world,
  gameTime: world.gameTime + delta,
});

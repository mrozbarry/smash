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

export const detectClosestPlatform = (object, world) => {
  const x1 = object.aabb.center.x - object.aabb.halfSize.x;
  const x2 = object.aabb.center.x + object.aabb.halfSize.x;

  return world.geometry
    .filter(rect => (
      (
        (rect.x <= x1 && (rect.x + rect.width) >= x1)
        && rect.y >= object.position.y
      ) || (
        (rect.x <= x2 && (rect.x + rect.width) >= x2)
        && rect.y >= object.position.y
      )
    ))
    .sort((a, b) => a.y - b.y)[0];
};

export const applyDelta = (delta, world) => ({
  ...world,
  gameTime: world.gameTime + delta,
});

export const make = (gravity, timestep, geometry = []) => ({
  gravity,
  timestep,
  geometry,
  lastFrameTime: 0,
  accumulator: 0,
});

export const setAccumulator = (accumulator, world) => ({
  ...world,
  accumulator,
});

export const detectClosestPlatform = (position, world) => {
  return world.geometry
    .filter(rect => (
      (rect.x <= position.x && (rect.x + rect.width) >= position.x)
      && rect.y >= position.y
    ))
    .sort((a, b) => a.y - b.y)[0];
};

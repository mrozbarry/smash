import { setAccumulator } from './world';

export const integrate = (delta, stepFn, world) => {
  let accumulator = world.accumulator + delta;

  while (accumulator > world.timestep) {
    stepFn(world);
    accumulator -= world.timestep;
  }

  return setAccumulator(accumulator, world);
};

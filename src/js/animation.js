import * as vec from './physics/vector2d';

export const make = (name, frameCount, timePerFrame = 250, initialFrame = 0, initialTime = 0) => ({
  name,
  time: initialTime,
  timePerFrame,
  frame: initialFrame,
  frameCount,
});

export const step = (delta, animation) => {
  let time = animation.time + delta;
  let frame = animation.frame;
  if (time > animation.timePerFrame) {
    time = 0;
    frame = (frame + 1) % animation.frameCount;
  }

  return {
    ...animation,
    time,
    frame,
  };
};

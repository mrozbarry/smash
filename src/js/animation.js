export const make = (name, frameCount, timePerFrame = 0.25, initialFrame = 0, initialTime = 0) => ({
  name,
  time: initialTime,
  timePerFrame,
  frame: initialFrame,
  frameCount,
  iteration: 0,
});

export const step = (delta, animation) => {
  let time = animation.time + delta;
  let frame = animation.frame;
  let iteration = animation.iteration;
  if (time > animation.timePerFrame) {
    time = 0;
    frame = frame + 1;
    if (frame >= animation.frameCount) {
      frame = 0;
      iteration += 1;
    }
  }

  return {
    ...animation,
    time,
    frame,
    iteration,
  };
};

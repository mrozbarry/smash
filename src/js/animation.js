import * as vec from './physics/vector2d';

const make = (name, spriteSheet, callback) => ({
  name,
  spriteSheet,
  callback,
  time: 0,
  frame: 0,
});

export const step = (delta, player, animation) => animation.callback(
  player,
  {
    ...animation,
    time: animation.time + delta,
  },
);

const makeLoop = (name, timePerFrame, spriteSheet) => {
  const frameTime = timePerFrame / 1000;
  return make(name, spriteSheet, (_player, animation) => {
    let { time, frame } = animation;
    if (time >= frameTime) {
      time -= frameTime;
      frame = (frame + 1) % animation.spriteSheet.frames;
    }

    return {
      ...animation,
      time,
      frame,
    };
  });
};

export const makeRun = (spriteSheet) => makeLoop('run', 150, spriteSheet);
export const makeIdle = (spriteSheet) => makeLoop('idle', 250, spriteSheet);

import * as vec from './vector2d';

export const make = (position, size) => ({
  previous: {
    position,
    speed: vec.zero,
    isOnGround: false,
    isJumping: false,
  },
  current: {
    position,
    speed: vec.zero,
    isOnGround: false,
    isJumping: false,
  },
  size,
  walkSpeed: 70,
  jumpSpeed: 2000,
});

export const step = (physics, inputs, dynamicObject) => {
  const isJumping = !dynamicObject.current.isJumping
    && dynamicObject.current.isOnGround
    && inputs.vertical > 0;

  const jump = isJumping
    ? dynamicObject.jumpSpeed
    : 0;

  return {
    ...dynamicObject,
    previous: dynamicObject.current,
    current: {
      ...dynamicObject.current,
      isJumping,
      isOnGround: !isJumping,
      position: vec.add(
        dynamicObject.current.speed,
        dynamicObject.current.position,
      ),
      speed: vec.multiply(
        0.9,
        vec.add(
          vec.add(
            dynamicObject.current.isOnGround
              ? vec.zero
              : physics.gravity,
            dynamicObject.current.speed,
          ),
          vec.make(
            dynamicObject.walkSpeed * inputs.horizontal * physics.timestep,
            -jump * physics.timestep,
          ),
        ),
      ),
    },
  };
};

export const clamp = (min, max, dynamicObject) => {
  const position = vec.clamp(min, max, dynamicObject.current.position);
  return {
    ...dynamicObject,
    current: {
      ...dynamicObject.current,
      position,
      isOnGround: position.y === max.y,
    },
  };
};

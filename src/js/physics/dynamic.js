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
  walkSpeed: 80,
  jumpSpeed: -50,
});

export const step = (physics, inputs, ground, dynamicObject) => {
  let position = vec.add(
    vec.multiply(physics.timestep, dynamicObject.current.speed),
    dynamicObject.current.position,
  );
  position.y = ground
    ? Math.min(ground.y, position.y)
    : position.y;

  const isOnGround = ground
    && position.y === ground.y
    && dynamicObject.current.speed.y >= 0;

  const isJumping = !dynamicObject.current.isJumping
    && isOnGround
    && inputs.jump > 0;

  return {
    ...dynamicObject,
    previous: { ...dynamicObject.current },
    current: {
      isOnGround,
      isJumping,
      position,
      speed: vec.add(
        vec.make(
          dynamicObject.current.speed.x * 0.9,
          dynamicObject.current.speed.y,
        ),
        vec.add(
          physics.gravity,
          vec.make(
            dynamicObject.walkSpeed * inputs.horizontal * (isOnGround ? 1 : 0.8),
            dynamicObject.jumpSpeed * inputs.jump * (isJumping ? 1 : 0.1),
          ),
        ),
      ),
    },
  };
};

export const clamp = (min, max, dynamicObject) => {
  const position = vec.clamp(min, max, dynamicObject.current.position);
  const isOnGround = position.y === max.y
    && !dynamicObject.previous.isOnGround
    && dynamicObject.current.speed.y > 0;

  return {
    ...dynamicObject,
    current: {
      ...dynamicObject.current,
      position,
      isOnGround,
    },
  };
};

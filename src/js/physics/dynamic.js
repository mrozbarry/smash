import * as vec from './vector2d';

export const make = (position, size) => ({
  position,
  speed: vec.zero,
  force: vec.zero,
  isOnGround: false,
  isJumping: false,
  size,
  walkSpeed: 100,
  jumpSpeed: -10000,
});

export const applyInputs = (inputs, dynamicObject) => {
  const isJumping = dynamicObject.isOnGround
    && !dynamicObject.isJumping
    && inputs.jump > 0;

  return {
    ...dynamicObject,
    isJumping,
    isOnGround: !isJumping,
    force: vec.add(
      vec.add(
        vec.make(
          dynamicObject.walkSpeed * inputs.horizontal,
          0,
        ),
        isJumping
          ? vec.make(0, dynamicObject.jumpSpeed * inputs.jump)
          : vec.zero,
      ),
      vec.make(
        dynamicObject.walkSpeed * inputs.horizontal,
      ),
    ),
  };
};

export const step = (physics, ground, dynamicObject) => {
  const speed = vec.add(
    vec.add(dynamicObject.speed, physics.gravity),
    dynamicObject.force,
  );

  let position = vec.add(
    vec.multiply(physics.timestep, speed),
    dynamicObject.position,
  );
  position.y = ground
    ? Math.min(ground.y, position.y)
    : position.y;

  const isOnGround = ground
    && position.y === ground.y
    && dynamicObject.speed.y >= 0;

  return {
    ...dynamicObject,
    isOnGround,
    position,
    speed: vec.make(
      dynamicObject.speed.x * 0.9,
      dynamicObject.speed.y,
    ),
  };
};

export const resetForce = (dynamicObject) => ({
  ...dynamicObject,
  force: vec.multiply(0.5, dynamicObject.force),
});

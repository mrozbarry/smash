import * as vec from './vector2d';

export const make = (position, size) => ({
  position,
  speed: vec.zero,
  isOnGround: false,
  isJumping: false,
  size,
  walkSpeed: 2,
  jumpSpeed: -9,
});

export const reset = (world, dynamicObject) => {
  const geo = world.geometry[Math.floor(Math.random() * world.geometry.length)];
  return {
    ...dynamicObject,
    isOnGround: false,
    isJumping: false,
    position: vec.make(
      geo.x + (geo.width / 2),
      100,
    ),
    speed: vec.zero,
  };
};

export const applyInputs = (inputs, dynamicObject) => {
  const isJumping = dynamicObject.isOnGround && inputs.jump > 0;

  return {
    ...dynamicObject,
    isJumping,
    speed: vec.add(
      vec.make(
        dynamicObject.walkSpeed * inputs.horizontal,
        isJumping && !dynamicObject.isJumping ? dynamicObject.jumpSpeed : 0,
      ),
      dynamicObject.speed,
    ),
  };
};

export const step = (world, ground, dynamicObject) => {
  const speed = vec.add(
    dynamicObject.speed,
    vec.multiply(
      world.timestep,
      world.gravity,
    ),
  );

  const isOnGround = ground
    && ground.y === dynamicObject.position.y
    && speed.y >= 0;

  if (isOnGround && speed.y > 0) {
    speed.y = 0;
  }

  let position = vec.add(
    speed,
    dynamicObject.position,
  );

  position.y = ground
    ? Math.min(ground.y, position.y)
    : position.y;

  return {
    ...dynamicObject,
    isOnGround,
    isJumping: isOnGround ? false : dynamicObject.isJumping,
    position,
    speed: vec.make(
      Math.max(-20, Math.min(20, speed.x * 0.8)),
      Math.max(-20, Math.min(20, speed.y)),
    ),
  };
};

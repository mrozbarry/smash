import * as vec from './vector2d';
import * as rect from './rect';
import * as aabb from './aabb';

export const make = (position, size) => ({
  position,
  aabb: aabb.make(
    vec.zero,
    vec.zero,
  ),
  speed: vec.zero,
  force: vec.zero,
  isOnGround: false,
  isJumping: false,
  isFacingRight: true,
  size,
  walkSpeed: 0.8,
  jumpSpeed: -9,
  punch: vec.make(
    10,
    -10,
  ),
});

export const reset = (world, object) => {
  const geo = world.geometry[Math.floor(Math.random() * world.geometry.length)];
  const x = geo.x + (geo.width / 2);
  return {
    ...object,
    isFacingRight: (Math.random() * 10) > 5,
    isOnGround: false,
    isJumping: false,
    position: vec.make(
      x,
      100,
    ),
    speed: vec.zero,
  };
};

export const applyInputs = (inputs, object) => {
  const isJumping = object.isOnGround && inputs.jump > 0;

  return {
    ...object,
    isJumping,
    isFacingRight: inputs.horizontal !== 0
      ? inputs.horizontal > 0
      : object.isFacingRight,
    speed: vec.add(
      vec.multiply(
        (inputs.punch === 0 ? 1 : 0),
        vec.make(
          object.walkSpeed * inputs.horizontal,
          isJumping && !object.isJumping ? object.jumpSpeed : 0,
        ),
      ),
      object.speed,
    ),
  };
};

export const step = (world, ground, object) => {
  const speed = vec.add(
    object.speed,
    vec.multiply(
      world.timestep,
      world.gravity,
    ),
  );

  const isOnGround = ground
    && ground.y === object.position.y
    && speed.y >= 0;

  if (isOnGround && speed.y > 0) {
    speed.y = 0;
  }

  let position = vec.add(
    speed,
    object.position,
  );

  position = vec.add(
    object.force,
    position,
  );

  position.y = ground
    ? Math.min(ground.y, position.y)
    : position.y;

  let speedX = speed.x * 0.9;
  if (Math.abs(speedX) < 0.01) {
    speedX = 0;
  }

  let force = vec.multiply(0.8, object.force);
  force.x = Math.abs(force.x) < 0.01 ? 0 : force.x;
  force.y = Math.abs(force.y) < 0.01 ? 0 : force.y;

  const boundingBox = rect.make(
    vec.make(
      object.position.x - (object.size.x / 2) - (object.isFacingRight ? 0 : (object.size.x / 4)),
      object.position.y - (object.size.y / 1.15),
    ),
    vec.make(
      object.size.x / 1.5,
      object.size.y / 1.15,
    ),
  );

  return {
    ...object,
    isOnGround,
    isJumping: isOnGround ? false : object.isJumping,
    position,
    aabb: aabb.fromRect(boundingBox),
    speed: vec.make(
      Math.max(-20, Math.min(20, speedX)),
      Math.max(-20, Math.min(20, speed.y)),
    ),
    force,
  };
};

export const applyForce = (force, object) => ({
  ...object,
  force,
});

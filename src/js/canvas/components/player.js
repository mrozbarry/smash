import { c } from 'declarativas';
import { revertableState } from './revertableState';
import { mirror } from './mirror';

const emptyImage = new Image();

export const player = (props) => {
  const rect = {
    x: 0,
    y: 0,
    width: props.object.size.x,
    height: props.object.size.y,
  };

  const animation = props.animationType;
  const spriteSheet = props.spriteSheets.woodcutter && props.spriteSheets.woodcutter[animation] && props.spriteSheets.woodcutter[animation].image
    ? props.spriteSheets.woodcutter[animation]
    : { image: emptyImage, frames: 1, size: 1 };

  const x = Math.floor(
    (props.game.gameTime * 4) % spriteSheet.frames,
  ) * spriteSheet.size;

  return c(revertableState, {}, [
    c('translate', {
      x: props.object.position.x - (props.object.size.x / 2),
      y: props.object.position.y - props.object.size.y,
    }),
    c('fillStyle', { value: 'black' }),
    c('fillText', { x: 0, y: -15, text: `S<${props.object.speed.x.toFixed(2)},${props.object.speed.y.toFixed(2)}>` }),
    c('fillText', { x: 0, y: 0, text: `J${props.object.isJumping ? 1 : 0} G${props.object.isOnGround ? 1 : 0}` }),
    c('strokeStyle', { value: props.color }),
    c('strokeRect', rect),
    c(mirror, { horizontal: !props.isFacingRight }, [
      !props.isFacingRight && c('translate', { x: -rect.width, y: 0 }),
      c('drawImage', {
        image: spriteSheet.image,
        source: {
          x: x,
          y: 0,
          width: 40, // spriteSheet.size,
          height: spriteSheet.size,
        },
        destination: rect,
      }),
    ]),
  ]);
};

import { c } from 'declarativas';
import { revertableState } from './revertableState';
import { mirror } from './mirror';

export const player = (props) => {
  const rect = {
    x: 0,
    y: 0,
    width: props.object.size.x,
    height: props.object.size.y,
  };

  const half = props.object.size.x / 2;

  const x = props.animation.frame * 48

  return c(revertableState, {}, [
    c('translate', {
      x: props.object.position.x - (props.object.size.x / 2),
      y: props.object.position.y - props.object.size.y,
    }),
    
    c('fillStyle', { value: props.color }),
    c('beginPath'),
    c('moveTo', { x: half, y: 0 }),
    c('lineTo', { x: half + 10, y: -10 }),
    c('lineTo', { x: half - 10, y: -10 }),
    c('closePath'),
    c('fill'),

    c(mirror, { horizontal: !props.isFacingRight }, [
      !props.isFacingRight && c('translate', { x: -rect.width, y: 0 }),
      c('drawImage', {
        image: props.animation.spriteSheet.image,
        source: {
          x: x,
          y: 0,
          width: props.animation.spriteSheet.size,
          height: props.animation.spriteSheet.size,
        },
        destination: {
          ...rect,
        },
      }),
    ]),
  ]);
};

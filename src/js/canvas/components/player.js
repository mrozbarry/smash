import { c } from 'declarativas';
import { mirror } from './mirror';
import { translate } from './translate';
import { equalateralTriangle } from './triangle';

import * as vec from '../../physics/vector2d';

export const player = (props) => {
  const rect = {
    x: 0,
    y: 0,
    width: props.object.size.x,
    height: props.object.size.y,
  };

  const x = props.animation.frame * 48

  return [
    c(translate, {
      x: props.object.position.x - (props.object.size.x / 2),
      y: props.object.position.y - props.object.size.y,
    }, [
      c('fillStyle', { value: 'black' }),
      c('fillText', {
        x: 0,
        y: -10,
        text: `Dead? ${props.dead.toString()}`,
      }),
      c(mirror, { horizontal: !props.object.isFacingRight }, [
        !props.object.isFacingRight && c('translate', { x: rect.width / -1.5, y: 0 }),
        c('drawImage', {
          // image: props.animation.spriteSheet.image,
          image: props.spriteSheet[props.animation.name].image,
          source: {
            x: x,
            y: 0,
            width: props.spriteSheet.idle.size - 1,
            height: props.spriteSheet.idle.size,
          },
          destination: rect,
        }),
      ]),
    ]),
    c(equalateralTriangle, {
      start: vec.add(
        props.object.aabb.center,
        vec.make(0, -props.object.aabb.halfSize.y),
      ),
      width: 20,
      height: -10,
    }, [
      c('fillStyle', { value: props.color }),
      c('fill'),
    ]),
    c(equalateralTriangle, {
      start: vec.add(
        props.object.aabb.center,
        vec.make(0, -props.object.aabb.halfSize.y),
      ),
      width: 20,
      height: -10,
    }, [
      c('lineWidth', { value: 2 }),
      c('strokeStyle', { value: 'black' }),
      c('stroke'),
    ]),
  ];
};

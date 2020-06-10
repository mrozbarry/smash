import { c } from 'declarativas';
import { mirror } from './mirror';
import { translate } from './translate';
import { equalateralTriangle } from './triangle';

import { fromAabb } from '../../physics/rect';
import * as vec from '../../physics/vector2d';

export const player = (props) => {
  const rect = {
    x: 0,
    y: 0,
    width: props.object.size.x,
    height: props.object.size.y,
  };

  const boundingBox = fromAabb(props.object.aabb);

  const offset = props.object.size.x / 4;

  const x = props.animation.frame * 48

  return [
    c(translate, {
      x: props.object.position.x - (props.object.size.x / 2),
      y: props.object.position.y - props.object.size.y,
    }, [
      c(mirror, { horizontal: !props.isFacingRight }, [
        !props.isFacingRight && c('translate', { x: rect.width / -2, y: 0 }),
        c('drawImage', {
          image: props.animation.spriteSheet.image,
          source: {
            x: x,
            y: 0,
            width: props.animation.spriteSheet.size,
            height: props.animation.spriteSheet.size,
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

    c('lineWidth', { value: 3 }),
    c('strokeStyle', { value: 'red' }),
    c('strokeRect', boundingBox),
    
  ];
};

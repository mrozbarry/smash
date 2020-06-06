import { c } from 'declarativas';

const size = {
  width: 40,
  height: 90,
};

/*
 *
 * +---+
 * |   |
 * |   |
 * |   |
 * y-x-+
 *
 */

export const player = (props) => [
  c('strokeStyle', { value: 'black' }),
  c('fillStyle', { value: props.color }),
  c('fillRect', {
    ...size,
    x: props.x - (size.width / 2),
    y: props.y - size.height,
  }),
  c('strokeRect', {
    ...size,
    x: props.x - (size.width / 2),
    y: props.y - size.height,
  }),
];

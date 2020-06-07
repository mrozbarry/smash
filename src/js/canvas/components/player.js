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

export const player = (props) => {
  const rect = {
    ...size,
    x: props.object.current.position.x - (size.width / 2),
    y: props.object.current.position.y - size.height,
  };
  return [
    c('strokeStyle', { value: 'black' }),
    c('fillStyle', { value: props.color }),
    c('fillRect', rect),
    c('strokeRect', rect),
  ];
};

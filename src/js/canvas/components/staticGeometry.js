import { c } from 'declarativas';

export const staticGeometry = (props) => [
  c('fillStyle', { value: '#efefef' }),
  c('fillRect', props),
  c('strokeStyle', { value: 'black' }),
  c('lineWidth', { value: 3 }),
  c('strokeRect', props),
];

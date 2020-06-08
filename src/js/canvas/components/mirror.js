import { c } from 'declarativas';
import { revertableState } from './revertableState';

export const mirror = (props, children) => {
  return c(revertableState, {}, [
    c('scale', {
      x: props.horizontal ? -1 : 1,
      y: props.vertical ? -1 : 1,
    }),
    children,
  ]);
};

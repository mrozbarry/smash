import { c } from 'declarativas';
import { translate } from './translate';

export const equalateralTriangle = (props, children) => c(translate, {
  ...props.start,
}, [
  c('beginPath'),
  c('moveTo', { x: 0, y: 0 }),
  c('lineTo', { x: (props.width / 2), y: props.height }),
  c('lineTo', { x: (props.width / -2), y: props.height }),
  c('closePath'),
  children,
]);

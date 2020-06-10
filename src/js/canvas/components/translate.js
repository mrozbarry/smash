import { c } from 'declarativas';
import { revertableState } from './revertableState';

export const translate = (props, children) => c(revertableState, {}, [
  c('translate', props),
  children,
]);

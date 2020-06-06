import { c } from 'declarativas';

export const revertableState = (_props, children) => [
  c('save'),
  children,
  c('restore'),
];

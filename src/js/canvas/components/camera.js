import { c } from 'declarativas';
import { revertableState } from './revertableState';

const min = (prev, value) => typeof prev !== 'number' ? value : Math.min(prev, value);
const max = (prev, value) => typeof prev !== 'number' ? value : Math.max(prev, value);

export const camera = (props, children) => {
  const boundaries = props.targets.reduce((boundaries, target) => ({
    top: min(boundaries.top, target.y - props.playerPadding),
    right: max(boundaries.right, target.x + props.playerPadding),
    bottom: max(boundaries.bottom, target.y + props.playerPadding),
    left: min(boundaries.left, target.x - props.playerPadding),
  }), { top: null, right: null, bottom: null, left: null });

  const width = boundaries.right - boundaries.left;
  const height = boundaries.bottom - boundaries.top;

  const size = {
    width: props.canvas.width,
    height: props.canvas.height,
  };

  const ratio = props.canvas.height / props.canvas.width;
  if (width >= height) {
    size.width = Math.max(props.canvas.width / 1.5, width);
    size.height = size.width * ratio;
  } else {
    size.height = Math.max(props.canvas.height / 1.5, height);
    size.width = size.height / ratio;
  }

  const position = {
    x: ((boundaries.left + boundaries.right) / 2),
    y: ((boundaries.top + boundaries.bottom) / 2),
  };

  return c(revertableState, {}, [
    c('translate', {
      x: (size.width / 2) - position.x,
      y: (size.height / 2) - position.y,
    }),

    c('scale', {
      x: props.canvas.width / size.width,
      y: props.canvas.height / size.height,
    }),

    children,
  ]);
};

import { c } from 'declarativas';
import { revertableState } from './revertableState';

let debugMemoValue = '';
const debugMemo = (value) => {
  const valueStr = JSON.stringify(value);
  if (valueStr === debugMemoValue) {
    return;
  }
  debugMemoValue = valueStr;
  console.log(value);
};

const min = (prev, value) => typeof prev !== 'number' ? value : Math.min(prev, value);
const max = (prev, value) => typeof prev !== 'number' ? value : Math.max(prev, value);

export const camera = (props, children) => {
  const boundaries = props.targets.reduce((boundaries, target) => ({
    top: min(boundaries.top, target.y),
    right: max(boundaries.right, target.x),
    bottom: max(boundaries.bottom, target.y),
    left: min(boundaries.left, target.x),
  }), { top: null, right: null, bottom: null, left: null });

  const width = boundaries.right - boundaries.left + (props.playerPadding * 2);
  const height = boundaries.bottom - boundaries.top + (props.playerPadding * 2);

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

  debugMemo({
    targets: props.targets,
    boundaries,
    size,
    position,
  });

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

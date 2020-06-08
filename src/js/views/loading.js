import { h } from 'hyperapp';
import * as actions from '../actions';

export const loading = (state) => {
  const items = Object.values(state.spriteSheets).reduce((sprites, collection) => {
    return [
      ...sprites,
      ...Object.values(collection),
    ];
  }, []);

  const done = items.filter(i => i.ready).length;

  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      width: `${state.canvas.width}px`,
      height: `${state.canvas.height}px`,
      border: '1px black solid',
      margin: '0 auto',
    },
  }, [
    h('h1', {}, `Loading... (${done} / ${items.length})`),
    done < items.length
      ? h('progress', { max: items.length, value: done })
      : h('button', { onclick: actions.StartGame }, 'Play'),
  ]);
};

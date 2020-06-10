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
    h('h1', {}, 'JS Smash'),
    done < items.length
      ? [
        h('h2', {}, 'Loading...'),
        h('progress', { max: items.length, value: done }),
      ]
      : h('button', { onclick: actions.StartLocalGame }, 'Local Play'),

    h('hr', { style: { width: '50%', margin: '3rem 0' } }),

    h('h3', {}, 'Powered By:'),
    h('ul', {}, [
      h('li', {}, h('a', { href: 'https://github.com/jorgebucaran/hyperapp', rel: 'noopener', target: '_blank' }, 'Hyperapp')),
      h('li', {}, h('a', { href: 'https://github.com/mrozbarry/declarativas', rel: 'noopener', target: '_blank' }, 'Declarativas')),
      h('li', {}, h('a', { href: 'https://peerjs.com', rel: 'noopener', target: '_blank' }, 'PeerJS')),
      h('li', {}, [
        'And Sprites from ',
        h('a', { href: 'https://craftpix.net/freebies/free-3-character-sprite-sheets-pixel-art/', rel: 'noopener', target: '_blank' }, 'CraftPix.net'),
      ]),
    ]),
  ]);
};

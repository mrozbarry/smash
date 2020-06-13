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
      : h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '25%',
        },
      }, [
        h('button', { onclick: actions.StartCharacterSelect }, 'Local Game'),
        h('button', { onclick: [actions.NetworkInitialize, {} ] }, 'Host Game'),
        h('form', {
          onsubmit: [
            actions.NetworkInitialize,
            (event) => {
              event.preventDefault();
              const formData = new FormData(event.target);
              const joinGameId = formData.get('joinGameId');
              return {
                joinGameId,
              };
            },
          ],
          style: {
            display: 'flex',
          },
        }, [
          h('input', {
            type: 'search',
            name: 'joinGameId',
            style: { flexGrow: 1 },
            placeholder: 'Join Game Code',
            required: true,
            minLength: 4,
            maxLength: 4,
            pattern: '[A-Za-z0-9]{4}',
          }),
          h('button', { type: 'submit' }, 'Join'),
        ]),
      ]),

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

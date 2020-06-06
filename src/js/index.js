import { app, h } from 'hyperapp';
import * as actions from './actions';
import * as effects from './effects';
import * as subscriptions from './subscriptions';

const ArrowKeyBinds = {
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'KeyZ': 'punch',
  'KeyX': 'kick',
  'Space': 'jump',
};

const init = () => {
  const state = {
    canvas: {
      width: 1280,
      height: 720,
      context: null,
    },
    players: {},
    game: {
      gravity: {
        x: 0,
        y: 0.01,
      },
      lastFrameTime: null,
    },
    level: {
      geometry: [
        {
          x: 100,
          y: 700,
          width: 1080,
          height: 20,
        },

      ],
    },
  };

  return [
    state,
    effects.Declarativas({
      state,
      AfterRenderAction: actions.Render,
    }),
  ];
};

app({
  init: init(),

  view: (state) => h('div', {}, [
    h('canvas', {
      id: 'canvas',
      width: state.canvas.width,
      height: state.canvas.height,
      style: {
        border: '1px black solid',
        display: 'block',
        margin: '0 auto',
      },
    })
  ]),

  subscriptions: (state) => [
    subscriptions.CanvasContext({
      canvasQuerySelector: '#canvas',
      SetContext: actions.CanvasSetContext,
    }),

    subscriptions.KeyboardPlayer({
      canvasQuerySelector: '#canvas',
      id: 'p1',
      color: '#f0f',
      keybinds: ArrowKeyBinds,
      OnAdd: actions.PlayerAdd,
      OnRemove: actions.PlayerRemove,
      OnInputChange: actions.PlayerInputChange,
    }),
  ],

  node: document.querySelector('#app'),
});

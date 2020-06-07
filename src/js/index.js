import { app, h } from 'hyperapp';
import * as actions from './actions';
import * as effects from './effects';
import * as subscriptions from './subscriptions';
import * as physics from './physics';

const ArrowKeyBinds = {
  'ArrowUp': 'up',
  'ArrowDown': 'down',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'KeyZ': 'punch',
  'KeyX': 'kick',
  'Space': 'jump',
};

const initialState = {
  canvas: {
    width: 1280,
    height: 720,
    context: null,
  },
  players: {},
  game: physics.world.make(
    physics.vec.make(0, 1.5),
    1 / 60,
    [
      {
        x: 100,
        y: 700,
        width: 1080,
        height: 20,
      },
    ],
  ),
};

app({
  init: [
    initialState,
    effects.Declarativas({
      state: initialState,
      AfterRenderAction: actions.Render,
    }),
  ],

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

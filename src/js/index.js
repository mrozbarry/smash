import { app, h } from 'hyperapp';
import * as actions from './actions';
import * as effects from './effects';
import * as subscriptions from './subscriptions';
import * as physics from './physics';

import { loading as loadingView } from './views/loading';
import { game as gameView } from './views/game';

import * as assetWoodCutter from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/1 Woodcutter/*.png';

const ArrowKeyBinds = {
  'ArrowUp': 'jump',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'KeyZ': 'punch',
  'KeyX': 'kick',
};

const WasdKeyBinds = {
  'KeyW': 'jump',
  'KeyA': 'left',
  'KeyD': 'right',
  'KeyF': 'punch',
  'KeyE': 'kick',
};

const initialState = {
  showGame: false,
  canvas: {
    width: 1280,
    height: 720,
    context: null,
  },
  spriteSheets: {},
  players: {},
  game: physics.world.make(
    physics.vec.make(0, 25),
    1 / 60,
    [
      {
        x: 300,
        y: 470,
        width: 680,
        height: 300,
      },
      {
        x: 100,
        y: 700,
        width: 1080,
        height: 20,
      },
      {
        x: 0,
        y: 550,
        width: 200,
        height: 20,
      },
      {
        x: 1080,
        y: 550,
        width: 200,
        height: 20,
      },
      {
        x: 540,
        y: 610,
        width: 200,
        height: 20,
      },
    ],
  ),
};

app({
  init: [
    initialState,
    [
      effects.LoadSpriteSheet({
        character: 'woodcutter',
        type: 'idle',
        frames: 4,
        size: 48,
        uri: assetWoodCutter.Woodcutter_idle,
        OnLoad: actions.SpriteSheetLoad,
        OnReady: actions.SpriteSheetReady,
      }),
      effects.LoadSpriteSheet({
        character: 'woodcutter',
        type: 'run',
        frames: 6,
        size: 48,
        uri: assetWoodCutter.Woodcutter_run,
        OnLoad: actions.SpriteSheetLoad,
        OnReady: actions.SpriteSheetReady,
      }),
      effects.LoadSpriteSheet({
        character: 'woodcutter',
        type: 'attack1',
        frames: 6,
        size: 48,
        uri: assetWoodCutter.Woodcutter_attack1,
        OnLoad: actions.SpriteSheetLoad,
        OnReady: actions.SpriteSheetReady,
      }),
      effects.LoadSpriteSheet({
        character: 'woodcutter',
        type: 'attack2',
        frames: 6,
        size: 48,
        uri: assetWoodCutter.Woodcutter_attack2,
        OnLoad: actions.SpriteSheetLoad,
        OnReady: actions.SpriteSheetReady,
      }),
    ],
  ],

  view: (state) => h('div', {}, [
    state.showGame
      ? gameView(state)
      : loadingView(state),
  ]),

  subscriptions: (state) => [
    state.showGame && [
      subscriptions.CanvasContext({
        canvasQuerySelector: '#canvas',
        SetContext: actions.CanvasSetContext,
      }),

      subscriptions.KeyboardPlayer({
        id: 'Arrows',
        color: '#f0f',
        keybinds: ArrowKeyBinds,
        OnAdd: actions.PlayerAdd,
        OnRemove: actions.PlayerRemove,
        OnInputChange: actions.PlayerInputChange,
      }),

      subscriptions.KeyboardPlayer({
        id: 'WASD',
        color: '#0ff',
        keybinds: WasdKeyBinds,
        OnAdd: actions.PlayerAdd,
        OnRemove: actions.PlayerRemove,
        OnInputChange: actions.PlayerInputChange,
      }),
    ],
  ],

  node: document.querySelector('#app'),
});

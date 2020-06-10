import { app, h } from 'hyperapp';
import * as actions from './actions';
import * as effects from './effects';
import * as subscriptions from './subscriptions';
import * as physics from './physics';

import * as level from './levels/demo';

import { loading as loadingView } from './views/loading';
import { game as gameView } from './views/game';

import * as assetWoodCutter from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/1 Woodcutter/*.png';
import * as assetGraveRobber from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/2 GraveRobber/*.png';
import * as assetSteamMan from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/3 SteamMan/*.png';

const ArrowKeyBinds = {
  'ArrowUp': 'jump',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'Slash': 'punch',
  // 'Period': 'kick',
};

const WasdKeyBinds = {
  'KeyW': 'jump',
  'KeyA': 'left',
  'KeyD': 'right',
  'KeyF': 'punch',
  // 'KeyE': 'kick',
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
    level.geometry,
  ),
};


app({
  init: [
    initialState,
    [
      ...effects.LoadSpritesForCharacter({
        character: 'Woodcutter',
        assetCollection: assetWoodCutter,
        size: 48,
        OnLoad: actions.SpriteSheetLoad,
        OnReady: actions.SpriteSheetReady,
      }),
      ...effects.LoadSpritesForCharacter({
        character: 'GraveRobber',
        assetCollection: assetGraveRobber,
        size: 48,
        OnLoad: actions.SpriteSheetLoad,
        OnReady: actions.SpriteSheetReady,
      }),
      ...effects.LoadSpritesForCharacter({
        character: 'SteamMan',
        assetCollection: assetSteamMan,
        size: 48,
        OnLoad: actions.SpriteSheetLoad,
        OnReady: actions.SpriteSheetReady,
      }),
    ],
  ],

  view: (state) => h('div', {}, [
    state.showGame
      ? gameView({
        state,
        characters: {
          woodcutter: assetWoodCutter.Woodcutter,
          graverobber: assetGraveRobber.GraveRobber,
          steamman: assetSteamMan.SteamMan,
        },
      })
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

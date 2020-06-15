import { app, h } from 'hyperapp';

import * as actions from './actions';
import * as effects from './effects';
import * as subscriptions from './subscriptions';

import { loading as loadingView } from './views/loading';
import { characterSelect as characterSelectView } from './views/characterSelect';
import { game as gameView } from './views/game';

import * as assetWoodCutter from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/1 Woodcutter/*.png';
import * as assetGraveRobber from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/2 GraveRobber/*.png';
import * as assetSteamMan from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/3 SteamMan/*.png';

const viewScene = (state) => {
  switch (state.view) {
  case 'loading':
    return h(loadingView, state);

  case 'characterSelect':
    return h(characterSelectView, {
      state,
      characters: {
        woodcutter: assetWoodCutter.Woodcutter,
        graverobber: assetGraveRobber.GraveRobber,
        steamman: assetSteamMan.SteamMan,
      },
    });

  case 'game':
    return h(gameView, {
      state,
      characters: {
        woodcutter: assetWoodCutter.Woodcutter,
        graverobber: assetGraveRobber.GraveRobber,
        steamman: assetSteamMan.SteamMan,
      },
    });
  }
}

app({
  init: [
    actions.initialState,
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
    h(viewScene, state),
  ]),

  subscriptions: (state) => {
    const controls = Object.values(state.controls);

    return [
      state.network.isInitialized && state.network.isHost && [
        subscriptions.PeerHost({
          OnOpen: actions.NetworkSetHostPeer,
          ClientAdd: actions.NetworkClientAdd,
          ClientRemove: actions.NetworkClientRemove,
          OnDone: actions.NetworkUnsetPeer,
          ClientAddPlayer: actions.HostClientAddPlayer,
          ClientSetPlayerInputs: actions.PlayerInputChange,
        }),
      ],

      state.network.isInitialized && !state.network.isHost && [
        state.network.joinGameId && subscriptions.PeerClient({
          joinGameId: state.network.joinGameId,
          OnOpen: actions.NetworkSetClientPeer,
          OnDone: actions.NetworkUnsetPeer,
          OnPlayersChange: actions.PlayersUpdateFromHost,
          OnStartGame: actions.StartGame,
        }),
      ],

      state.view === 'game' && [
        subscriptions.CanvasContext({
          canvasQuerySelector: '#canvas',
          SetContext: actions.CanvasSetContext,
        }),

        controls
          .filter(c => typeof c.gamepadIndex === 'number')
          .map((props) => (
            subscriptions.GamepadPlayer({
              ...props,
              OnInputChange: actions.PlayerInputChange,
            })
          )),

        controls
          .filter(c => c.keybind)
          .map((props) => (
            subscriptions.KeyboardPlayer({
              ...props,
              keybinds: state.keybinds[props.keybind],
              OnInputChange: actions.PlayerInputChange,
            })
          )),
      ],

      state.view === 'characterSelect' && [
        subscriptions.GamepadConnections({
          OnGamepadsChange: actions.GamepadsUpdate,
        }),
      ],
    ];
  },

  node: document.querySelector('#app'),
});

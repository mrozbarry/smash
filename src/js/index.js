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
    state.network.peer && [
      h('hr'),
      h('div', {}, 'Connections:'),
      h('ul', {}, [
        state.network.connections.map((connection) => h('li', {
          style: {
            borderBottom: '1px black solid',
            marginBottom: '0.5rem',
            paddingBottom: '0.5rem',
          },
        }, [
          h('div', {}, `ID: ${connection.client.peer}`),
        ])),
      ]),
    ],
  ]),

  subscriptions: (state) => {
    const controls = Object.values(state.controls);

    return [
      state.network.peer && [
        subscriptions.PeerHandler({
          peer: state.network.peer,
          ClientAdd: actions.NetworkClientAdd,
          OnDone: actions.NetworkUnsetPeer,
        }),

        ...state.network.connections.map((connection) => (
          subscriptions.PeerConnection({
            connection,
            ClientRemove: actions.NetworkClientRemove,
            ClientAddPlayer: actions.PlayerMerge,
            ClientSetPlayerInputs: actions.PlayerInputChange,
            AddConnection: actions.NetworkConnect,
          })
        )),
      ],

      state.view === 'game' && [
        subscriptions.CanvasContext({
          canvasQuerySelector: '#canvas',
          SetContext: actions.CanvasSetContext,
        }),

        controls
          .filter(c => !Number.isNaN(c.gamepadIndex))
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

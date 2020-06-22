import * as effects from '../effects';
import * as physics from '../physics';
import * as animation from '../animation';

import * as SpriteSheet from './spriteSheet';
import * as CharacterSelection from './characterSelection';
import * as Player from './player';
import * as Game from './game';
import * as Network from './network';

export const initialState = {
  ...SpriteSheet.state,
  ...CharacterSelection.state,
  ...Player.state,
  ...Game.state,
  ...Network.state,
  view: 'loading',
  canvas: {
    width: 1280,
    height: 720,
    context: null,
  },
};

export const SpriteSheetLoad = SpriteSheet.SpriteSheetLoad;
export const SpriteSheetReady = SpriteSheet.SpriteSheetReady;

export const GamepadsUpdate = CharacterSelection.GamepadsUpdate;
export const CharacterSelectionSetColor = CharacterSelection.CharacterSelectionSetColor;
export const CharacterSelectionSetName = CharacterSelection.CharacterSelectionSetName;
export const CharacterSelectionSetKeybind = CharacterSelection.CharacterSelectionSetKeybind;
export const CharacterSelectionStart = CharacterSelection.CharacterSelectionStart;

export const PlayerAdd = Player.PlayerAdd;
export const PlayerChangeCharacter = Player.PlayerChangeCharacter;
export const PlayerReady = Player.PlayerReady;
export const PlayerActive = Player.PlayerActive;
export const PlayerMerge = Player.PlayerMerge;
export const PlayerRespawn = Player.PlayerRespawn;
export const PlayerRemove = Player.PlayerRemove;
export const PlayerInputChange = Player.PlayerInputChange;
export const PlayerGetPunched = Player.PlayerGetPunched;

export const GameStart = Game.GameStart;
export const GameRender = Game.GameRender;

export const NetworkInitialize = Network.NetworkInitialize;
export const NetworkSetPeer = Network.NetworkSetPeer;
export const NetworkUnsetPeer = Network.NetworkUnsetPeer;
export const NetworkConnect = Network.NetworkConnect;
export const NetworkClientAdd = Network.NetworkClientAdd;
export const NetworkClientRemove = Network.NetworkClientRemove;


export const CanvasSetContext = (state, context) => ({
  ...state,
  canvas: {
    ...state.canvas,
    context,
  },
});

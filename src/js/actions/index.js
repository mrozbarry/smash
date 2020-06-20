import * as effects from '../effects';
import * as physics from '../physics';
import * as animation from '../animation';

import * as Peer from '../lib/peer';

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
  network: {
    id: null,
    peer: null,
    connections: [],
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

export const Render = (state) => {
  const now = performance.now();
  const delta = state.game.lastFrameTime
    ? (now - state.game.lastFrameTime) / 1000
    : 0;

  let players = Object.values(state.players)
    .map((player) => ({
      ...player,
      object: physics.dynamic.applyInputs(player.inputs, player.animation.name.startsWith('attack'), player.object),
    }));

  const game = physics.world.applyDelta(delta, physics.integrate(delta, () => {
    players = players.map(player => {
      if (player.dead) return player;

      const ground = physics.world.detectClosestPlatform(
        player.object,
        state.game,
      );

      const object = physics.dynamic.step(
        state.game,
        ground,
        player.object,
      );

      const targetDistanceForward = player.object.size.x;
      const targetDisanceBackward = player.object.size.x * 0.3;

      const targets = players
        .filter(p => (
          p.id !== player.id
          && Math.abs(p.object.position.y - player.object.position.y) <= ((p.object.size.y + player.object.size.y) / 4)
          && (
            object.isFacingRight
              ? (p.object.position.x > (player.object.position.x - targetDisanceBackward) && p.object.position.x < (player.object.position.x + targetDistanceForward))
              : (p.object.position.x < (player.object.position.x + targetDisanceBackward) && p.object.position.x > (player.object.position.x - targetDistanceForward))
          )
        ));

      let playerAnimation = animation.step(
        state.game.timestep,
        player.animation,
      );
      if (playerAnimation.name === 'attack1' && playerAnimation.iteration === 0) {
        // Noop
      } else if (playerAnimation.name !== 'idle' && player.inputs.horizontal === 0) {
        playerAnimation = animation.make(
          'idle',
          state.spriteSheets[player.character].idle.frames,
          0.25,
        );
      } else if (player.inputs.horizontal !== 0) {
        playerAnimation = animation.make(
          'run',
          state.spriteSheets[player.character].run.frames,
          Math.max(0.1, 1 - (Math.abs(object.speed.x) / 2)),
          playerAnimation.name === 'run'
            ? playerAnimation.frame
            : 0,
          playerAnimation.name === 'run'
            ? playerAnimation.time
            : 0,
        );
      }

      return {
        ...player,
        animation: playerAnimation,
        targets,
        object,
      };
    });

  }, state.game));

  const lowestYValue = game.geometry.reduce((lowestY, geometry) => Math.max(
    lowestY,
    geometry.y,
    geometry.y + geometry.height,
  ), 0);

  const idsToKill = players
    .filter(p => (
      p.object.position.y > (lowestYValue + (p.object.size.y * 2))
      && !p.dead
      && !!state.controls[p.id]
    ))
    .map(p => p.id);

  players = players.reduce((nextPlayers, p) => ({
    ...nextPlayers,
    [p.id]: {
      ...p,
      dead: idsToKill.includes(p.id) ? true : p.dead,
      deaths: !p.dead && idsToKill.includes(p.id) ? p.deaths + 1 : p.deaths,
    },
  }), {});

  const nextState = {
    ...state,
    game: {
      ...game,
      lastFrameTime: now,
    },
    players,
  };

  return [
    nextState,
    [
      effects.Declarativas({
        state: nextState,
        AfterRenderAction: Render,
      }),
      ...idsToKill.map((id) => effects.RespawnPlayer({
        id,
        PlayerReset: PlayerRespawn,
      })),
    ],
  ]
};


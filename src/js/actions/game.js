import * as effects from '../effects';

import * as physics from '../physics';

import * as animation from '../animation';
import * as pipeline from '../lib/pipeline';

import * as level from '../levels/demo';

export const state = {
  game: physics.world.make(
    physics.vec.make(0, 25),
    1 / 60,
    level.geometry,
  ),
};

export const GameStart = (state, {
  RenderAction,
  OnRespawn,
}) => {
  const localIds = Object.keys(state.controls);
  const players = localIds.reduce((memo, id) => ({
    ...memo,
    [id]: {
      ...memo[id],
      dead: false,
    },
  }), state.players);

  const nextState = {
    ...state,
    players,
    view: 'game',
  };

  return [
    nextState,
    [
      effects.Declarativas({
        state: nextState,
        AfterRenderAction: RenderAction,
        OnRespawn,
      }),
      ...localIds.map((id) => (
        effects.MessageClients({
          clients: state.network.clients,
          payload: {
            type: 'player.update',
            player: players[id],
          },
        })
      )),
    ],
  ];
};

const animationPipeline = (spriteSheets) => pipeline.make([
  // Continue attack until 1 full animation cycle
  (next, player) => {
    if (!player.object.isAttacking || player.animation.iteration > 0) {
      return next(player);
    }
    return player;
  },

  // Idle if no horizontal input
  (next, player) => {
    if (player.animation.name === 'idle' || player.inputs.horizontal) {
      return next(player);
    }
    return {
      ...player,
      animation: animation.make(
        'idle',
        spriteSheets[player.character].idle.frames,
        0.25,
      ),
      object: physics.dynamic.attack(false, false, player.object),
    };
  },

  (next, player) => {
    if (Math.abs(player.inputs.horizontal) < 0.01) {
      return next(player);
    }

    const animationName = player.object.isRunning ? 'run' : 'walk';

    return {
      ...player,
      animation: animation.make(
        animationName,
        spriteSheets[player.character][animationName].frames,
        Math.max(0.1, 1 - (Math.abs(player.object.speed.x) / 2)),
        player.animation.name === animationName
          ? player.animation.frame
          : 0,
        player.animation.name === animationName
          ? player.animation.time
          : 0,
      ),
      object: physics.dynamic.attack(false, false, player.object),
    };
  },
]);

export const GameRender = (state, {
  OnRespawn,
}) => {
  const now = performance.now();
  const delta = state.game.lastFrameTime
    ? (now - state.game.lastFrameTime) / 1000
    : 0;

  let players = Object.values(state.players)
    .map((player) => ({
      ...player,
      object: physics.dynamic.applyInputs(player.inputs, player.object),
    }));

  const game = physics.world.applyDelta(delta, physics.integrate(delta, () => {
    players = players.map(player => {
      if (player.dead) return player;

      const ground = physics.world.detectClosestPlatform(
        player.object,
        state.game,
      );

      let object = physics.dynamic.step(
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

      return animationPipeline(state.spriteSheets)({
        ...player,
        animation: animation.step(state.game.timestep, player.animation),
        targets,
        object,
      });
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
        AfterRenderAction: GameRender,
        OnRespawn,
      }),
      ...idsToKill.map((id) => effects.RespawnPlayer({
        id,
        PlayerReset: OnRespawn,
      })),
      effects.MessageClients({
        clients: state.network.clients,
        payload: {
          type: 'players.update',
          players: Object
            .keys(state.controls)
            .map((id) => players[id]),
        },
      }),
    ],
  ]
};


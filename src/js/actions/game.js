import * as effects from '../effects';

import * as physics from '../physics';

import * as animation from '../animation';

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
        effects.MessageConnections({
          connections: state.network.connections,
          payload: {
            type: 'player.update',
            player: players[id],
          },
        })
      )),
    ],
  ];
};

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

      let playerAnimation = animation.step(
        state.game.timestep,
        player.animation,
      );
      if (object.isAttacking && playerAnimation.iteration === 0) {
        // Noop
      } else if (playerAnimation.name !== 'idle' && player.inputs.horizontal === 0) {
        playerAnimation = animation.make(
          'idle',
          state.spriteSheets[player.character].idle.frames,
          0.25,
        );
        object = physics.dynamic.attack(false, false, object);
      } else if (player.inputs.horizontal !== 0) {
        const animationName = player.object.isRunning ? 'run' : 'walk';
        playerAnimation = animation.make(
          animationName,
          state.spriteSheets[player.character][animationName].frames,
          Math.max(0.1, 1 - (Math.abs(object.speed.x) / 2)),
          playerAnimation.name === animationName
            ? playerAnimation.frame
            : 0,
          playerAnimation.name === animationName
            ? playerAnimation.time
            : 0,
        );
        object = physics.dynamic.attack(false, false, object);
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
        AfterRenderAction: GameRender,
        OnRespawn,
      }),
      ...idsToKill.map((id) => effects.RespawnPlayer({
        id,
        PlayerReset: OnRespawn,
      })),
    ],
  ]
};


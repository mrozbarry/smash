import * as effects from './effects';
import * as physics from './physics';

const omit = (key, object) => {
  const { [key]: discard, ...nextObject } = object;
  return nextObject;
};


export const PlayerAdd = (state, { id, color }) => ({
  ...state,
  players: {
    ...state.players,
    [id]: {
      id,
      inputs: {
        horizontal: 0,
        vertical: 0,
        punch: 0,
        kick: 0,
        jump: 0,
      },
      color,
      object: physics.dynamic.make(
        physics.vec.make(
          state.canvas.width / 2,
          100,
        ),
      ),
    },
  },
});

export const PlayerRemove = (state, { id }) => ({
  ...state,
  players: omit(id, state.players), });

export const PlayerInputChange = (state, { id, inputKey, value }) => ({
  ...state,
  players: {
    ...state.players,
    [id]: {
      ...state.players[id],
      inputs: {
        ...state.players[id].inputs,
        [inputKey]: value,
      },
    },
  },
});

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

  let players = Object.values(state.players);
  const game = physics.integrate(delta, () => {
    players = players.map(player => {
      let object = physics.dynamic.step(
        state.game,
        player.inputs,
        player.object,
      );

      const geo = physics.world.detectClosestPlatform(
        object.previous.position,
        state.game,
      );

      const max = physics.vec.make(
        1280,
        geo ? geo.y : 720,
      );

      return {
        ...player,
        object: physics.dynamic.clamp(
          physics.vec.zero,
          max,
          object,
        ),
      };
    });
  }, state.game);

  players = players.reduce((nextPlayers, p) => ({
    ...nextPlayers,
    [p.id]: p,
  }), {});

  return [
    {
      ...state,
      game: {
        ...game,
        lastFrameTime: now,
      },
      players,
    },
    effects.Declarativas({
      state,
      AfterRenderAction: Render,
    }),
  ]
};

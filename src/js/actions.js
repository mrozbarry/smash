import * as effects from './effects';

const omit = (key, object) => {
  const { [key]: discard, ...nextObject } = object;
  console.log('omit', {
    key,
    object,
    discard,
    nextObject,
  });
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
      x: state.canvas.width / 2,
      y: 10,
      vx: 0,
      vy: 0,
      mass: 1,
    },
  },
});

export const PlayerRemove = (state, { id }) => ({
  ...state,
  players: omit(id, state.players),
});

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
    ? now - state.game.lastFrameTime
    : 0;

  const clampX = (v) => Math.min(
    state.canvas.width,
    Math.max(
      0,
      v,
    ),
  );

  const clampY = (v) => Math.min(
    state.canvas.height,
    Math.max(
      0,
      v,
    ),
  );

  return [
    {
      ...state,
      game: {
        ...state.game,
        lastFrameTime: now,
      },
      players: Object.keys(state.players).reduce((players, id) => {
        const p = state.players[id];
        const vx = p.vx
          + ((state.game.gravity.x) * delta)
          + ((p.inputs.horizontal * 0.1) * delta);
        const vy = p.vy
          + ((state.game.gravity.y) * delta)
          + ((Math.max(0, p.inputs.vertical) * -0.15) * delta);

        return {
          ...players,
          [id]: {
            ...p,
            x: clampX(p.x + vx),
            y: clampY(p.y + vy),
            vx: vx / 1.5,
            vy,
          },
        };
      }, {}),
    },
    effects.Declarativas({
      state,
      AfterRenderAction: Render,
    }),
  ]
};

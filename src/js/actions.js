import * as effects from './effects';
import * as physics from './physics';
import * as animation from './animation';

import * as assetWoodCutter from '../sprites/craftpix-891178-free-3-character-sprite-sheets-pixel-art/1 Woodcutter/*.png';

const omit = (key, object) => {
  const { [key]: _discard, ...nextObject } = object;
  return nextObject;
};


export const SpriteSheetLoad = (state, {
  character,
  type,
  size,
}) => ({
  ...state,
  spriteSheets: {
    ...state.spriteSheets,
    [character]: {
      ...state.spriteSheets[character],
      [type]: {
        image: new Image(),
        size,
        ready: false,
      },
    },
  },
});

export const SpriteSheetReady = (state, {
  character,
  type,
  image,
  frames,
}) => ({
  ...state,
  spriteSheets: {
    ...state.spriteSheets,
    [character]: {
      ...state.spriteSheets[character],
      [type]: {
        ...state.spriteSheets[character][type],
        frames,
        image,
        ready: true,
      },
    },
  },
});


export const StartGame = (state) => [
  {
    ...state,
    showGame: true,
  },
  effects.Declarativas({
    state,
    AfterRenderAction: Render,
  }),
];


export const PlayerAdd = (state, { id, color }) => {
  const x = (state.canvas.width / 2) + ((Math.random() * 300) - 150);

  const character = 'woodcutter';
  const parent = state.spriteSheets[character];

  return {
    ...state,
    players: {
      ...state.players,
      [id]: {
        id,
        character,
        isFacingRight: x < state.canvas.width / 2,
        animationType: 'idle',
        animation: animation.makeIdle(parent.idle),
        inputs: {
          horizontal: 0,
          vertical: 0,
          punch: 0,
          kick: 0,
          jump: 0,
        },
        targets: [],
        deaths: 0,
        color,
        object: physics.dynamic.reset(
          state.game,
          physics.dynamic.make(
            physics.vec.zero,
            physics.vec.make(
              40,
              90,
            ),
          ),
        ),
      },
    },
  };
};

export const PlayerRemove = (state, { id }) => ({
  ...state,
  players: omit(id, state.players),
});

export const PlayerKill = (state, { id }) => ({
  ...state,
  players: {
    ...state.players,
    [id]: {
      ...state.players[id],
      deaths: state.players[id].deaths + 1,
      object: physics.dynamic.reset(state.game, state.players[id].object),
    },
  },
});

export const PlayerInputChange = (state, {
  id,
  inputKey,
  value,
}) => {
  const player = state.players[id];
  const parent = state.spriteSheets[player.character];

  const didPunch = inputKey === 'punch' && value > 0 && player.inputs.punch === 0;
  const targetIds = player.targets.map(t => t.id);

  const punchEffects = didPunch
    ? effects.Punch({ sourceId: id, targetIds, OnPunch: PlayerGetPunched })
    : [];

  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: {
          ...state.players[id],
          isFacingRight: inputKey === 'horizontal' && value !== 0
            ? value > 0
            : player.isFacingRight,
          animationType: inputKey === 'horizontal'
            ? (value !== 0 ? 'run' : 'idle')
            : state.players[id].animationType,
          animation: inputKey === 'horizontal'
            ? (value !== 0 ? animation.makeRun(parent.run) : animation.makeIdle(parent.idle))
            : player.animation,
          inputs: {
            ...state.players[id].inputs,
            [inputKey]: value,
          },
        },
      },
    },
    punchEffects,
  ];
};

export const PlayerGetPunched = (state, { id, sourceId }) => {
  const player = state.players[id];
  const sourcePlayer = state.players[sourceId];
  const force = physics.vec.make(
    sourcePlayer.object.punch.x * (sourcePlayer.isFacingRight ? 1 : -1),
    sourcePlayer.object.punch.y,
  );

  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: {
          ...player,
          object: physics.dynamic.applyForce(force, player.object),
        },
      },
    },
  ];
};

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
      object: physics.dynamic.applyInputs(player.inputs, player.object),
    }));

  const game = physics.world.applyDelta(delta, physics.integrate(delta, () => {
    players = players.map(player => {
      const ground = physics.world.detectClosestPlatform(
        player.object.position,
        player.object.size,
        state.game,
      );

      const object = physics.dynamic.step(
        state.game,
        ground,
        player.object,
      );

      const targets = players
        .filter(p => (
          p.id !== player.id
          && Math.abs(p.object.position.y - player.object.position.y) < 30
          && (
            player.isFacingRight
              ? (p.object.position.x > (player.object.position.x - 10) && p.object.position.x < (player.object.position.x + 40))
              : (p.object.position.x < (player.object.position.x + 10) && p.object.position.x > (player.object.position.x - 40))
          )
        ));

      return {
        ...player,
        targets,
        object,
      };
    });

  }, state.game));

  const idsToKill = players
    .filter(p => (
      p.object.position.y > (state.canvas.height + (p.object.size.y * 2))
      && p.object.speed.y === 20
    ))
    .map(p => p.id);

  players = players.reduce((nextPlayers, p) => ({
    ...nextPlayers,
    [p.id]: {
      ...p,
      animation: animation.step(delta, p, p.animation),
      deaths: idsToKill.includes(p.id) ? p.deaths + 1 : p.deaths,
      object: idsToKill.includes(p.id) ? physics.dynamic.reset(state.game, p.object) : p.object,
    },
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

import randomColor from 'randomcolor';

import * as effects from './effects';
import * as physics from './physics';
import * as animation from './animation';

const omit = (key, object) => {
  const { [key]: _discard, ...nextObject } = object;
  return nextObject;
};

export const GamepadsUpdate = (state, gamepads) => {
  const canUpdateKeybind = state.value == 'characterSelect'
    && state.characterSelection.keybind === ''
    && state.characterSelect.gamepadIndex === null;

  const newGamepad = state.gamepads.find((gamepad, index) => (
    (!gamepad || !gamepad.connected)
    && (gamepads[index] && gamepads[index].connected)
  ));

  const willChangeCharacterSelection = canUpdateKeybind && newGamepad;

  const characterSelection = willChangeCharacterSelection
    ? { ...state.characterSelection, keybind: '', gamepadIndex: newGamepad.index }
    : state.characterSelection;

  return [
    {
      ...state,
      gamepads,
      characterSelection,
    },
    willChangeCharacterSelection && effects.RumbleGamepad({
      gamepad: newGamepad,
    }),
  ];
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

export const CharacterSelectionSetColor = (state, { color }) => ({
  ...state,
  characterSelection: {
    ...state.characterSelection,
    color,
  },
});

export const CharacterSelectionSetName = (state, { name }) => ({
  ...state,
  characterSelection: {
    ...state.characterSelection,
    name,
  },
});

export const CharacterSelectionSetKeybind = (state, { keybind, gamepadIndex }) => ({
  ...state,
  characterSelection: {
    ...state.characterSelection,
    keybind: keybind || '',
    gamepadIndex: typeof gamepadIndex === 'number' ? gamepadIndex : null,
  },
});

export const CharacterSelectionAddLocalConnection = (state) => ({
  ...state,
  characterSelection: {
    color: randomColor(),
    name: '',
    keybind: '',
    gamepadIndex: null,
  },
  connections: [
    ...state.connections,
    {
      type: 'local',
      id: Math.random().toString(36).slice(2),
      color: state.characterSelection.color,
      name: state.characterSelection.name,
      keybind: state.characterSelection.keybind,
      gamepadIndex: state.characterSelection.gamepadIndex,
      character: 'woodcutter',
      ready: false,
    },
  ],
});

export const ConnectionChangeCharacter = (state, { id, character }) => ({
  ...state,
  connections: state.connections.map((connection) => ({
    ...connection,
    character: connection.id === id
      ? character
      : connection.character,
  })),
});

export const ConnectionReady = (state, { id }) => ({
  ...state,
  connections: state.connections.map((connection) => ({
    ...connection,
    ready: connection.id === id
      ? true
      : connection.ready,
  })),
});

export const ConnectionRemove = (state, { id }) => ({
  ...state,
  connections: state.connections.filter(c => c.id !== id),
});

export const StartCharacterSelect = (state) => ({
  ...state,
  view: 'characterSelect',
});


export const StartLocalGame = (state) => [
  {
    ...state,
    view: 'game',
  },
  effects.Declarativas({
    state,
    AfterRenderAction: Render,
  }),
];


export const PlayerAdd = (state, { id, name, color, keybinds, character }) => {
  const x = (state.canvas.width / 2) + ((Math.random() * 300) - 150);

  const parent = state.spriteSheets[character];

  return {
    ...state,
    players: {
      ...state.players,
      [id]: {
        id,
        name,
        character,
        isFacingRight: x < state.canvas.width / 2,
        punchCountdown: null,
        animation: animation.makeIdle(parent.idle),
        keybinds,
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
              90,
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

  let playerAnimation = player.animation;
  let punchCountdown = player.punchCountdown;
  if (didPunch) {
    punchCountdown = 0.2;
    playerAnimation = animation.makeAttack(
      'attack1',
      parent.attack1,
      player.animation,
    );
  } else if (playerAnimation.name.startsWith('attack')) {
    // Noop
  } else if (inputKey === 'horizontal' && value === 0) {
    playerAnimation = animation.makeIdle(parent.idle);
  } else if (inputKey === 'horizontal' && value !== 0) {
    playerAnimation = animation.makeRun(parent.run);
  }

  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: {
          ...player,
          punchCountdown: player.animation.name.startsWith('attack') ? player.punchCountdown : punchCountdown,
          isFacingRight: inputKey === 'horizontal' && value !== 0
            ? value > 0
            : player.isFacingRight,
          animation: playerAnimation,
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
  const force = physics.vec.add(
    physics.vec.make(
      sourcePlayer.object.punch.x * (sourcePlayer.isFacingRight ? 1 : -1),
      sourcePlayer.object.punch.y,
    ),
    sourcePlayer.object.speed,
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
        player.object,
        state.game,
      );

      const object = physics.dynamic.step(
        state.game,
        ground,
        player.isFacingRight,
        player.object,
      );

      const targetDistanceForward = player.object.size.x;
      const targetDisanceBackward = player.object.size.x * 0.3;

      const targets = players
        .filter(p => (
          p.id !== player.id
          && Math.abs(p.object.position.y - player.object.position.y) <= ((p.object.size.y + player.object.size.y) / 4)
          && (
            player.isFacingRight
              ? (p.object.position.x > (player.object.position.x - targetDisanceBackward) && p.object.position.x < (player.object.position.x + targetDistanceForward))
              : (p.object.position.x < (player.object.position.x + targetDisanceBackward) && p.object.position.x > (player.object.position.x - targetDistanceForward))
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

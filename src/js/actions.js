import randomColor from 'randomcolor';

import * as effects from './effects';
import * as physics from './physics';
import * as animation from './animation';

import * as level from './levels/demo';

import * as Peer from './lib/peer';

const omit = (key, object) => {
  const { [key]: _discard, ...nextObject } = object;
  return nextObject;
};

export const initialState = {
  view: 'loading',
  canvas: {
    width: 1280,
    height: 720,
    context: null,
  },
  gamepads: [null, null, null, null],
  spriteSheets: {},
  players: {},
  controls: {},
  game: physics.world.make(
    physics.vec.make(0, 25),
    1 / 60,
    level.geometry,
  ),
  keybinds: {
    Arrows: {
      'ArrowUp': 'jump',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Slash': 'punch',
    },
    WASD: {
      'KeyW': 'jump',
      'KeyA': 'left',
      'KeyD': 'right',
      'KeyF': 'punch',
    },
  },
  characterSelection: {
    color: randomColor(),
    name: '',
    keybind: '',
    gamepadIndex: null,
  },
  network: {
    id: null,
    peer: null,
    connections: [],
  },
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

export const CharacterSelectionSetKeybind = (state, { value }) => {
  const keybind = state.keybinds[value] ? value : '';
  const gamepadIndex = state.gamepads.some(gp => gp && (gp.index == value)) ? value : null;
  return ({
    ...state,
    characterSelection: {
      ...state.characterSelection,
      keybind,
      gamepadIndex,
    },
  });
};

const _PlayerChange = (id, mutation, state) => {
  const player = mutation(state.players[id]);
  const players = {
    ...state.players,
    [id]: player,
  };

  if (!state.network.peer) {
    return { ...state, players };
  }

  return [
    {
      ...state,
      players,
    },
    effects.MessageConnections({
      connections: state.network.connections,
      payload: {
        type: 'player.update',
        player,
      },
    }),
  ];
}

export const CharacterSelectionAddPlayer = (state, {
  keybind,
  gamepadIndex,
  color,
  name,
}) => {
  const id = Math.random().toString(36).slice(2);

  const object = physics.dynamic.reset(
    state.game,
    physics.dynamic.make(
      physics.vec.zero,
      physics.vec.make(
        90,
        90,
      ),
    ),
  );

  const character = 'woodcutter';

  const player = {
    id,
    ready: false,
    active: false,
    name,
    character,
    inputs: {
      horizontal: 0,
      punch: 0,
      jump: 0,
    },
    animation: animation.make(
      'idle',
      state.spriteSheets[character].idle.frames,
      0.25,
    ),
    targets: [],
    deaths: 0,
    color,
    object,
  };

  const playerControls = {
    id,
    keybind,
    gamepadIndex,
  };

  return _PlayerChange(id, () => player, {
    ...state,
    characterSelection: {
      color: randomColor(),
      name: '',
      keybind: '',
      gamepadIndex: null,
    },
    controls: {
      ...state.controls,
      [id]: playerControls,
    },
  });
};

export const PlayerChangeCharacter = (state, { id, character }) => {
  return _PlayerChange(id, (player) => ({
    ...player,
    character,
  }), state);
};

export const PlayerReady = (state, { id, ready }) => {
  return _PlayerChange(id, (player) => ({
    ...player,
    ready,
  }), state);
};

export const PlayerActive = (state, { id, active }) => {
  return _PlayerChange(id, (player) => ({
    ...player,
    active,
  }), state);
};

export const PlayerMerge = (state, { player }) => {
  const players = {
    ...state.players,
    [player.id]: player,
  };

  return {
    ...state,
    players,
  };
};

export const PlayerRespawn = (state, { id }) => {
  const initialPlayer = state.players[id];
  if (!initialPlayer) return state;

  const player = {
    ...initialPlayer,
    object: physics.dynamic.reset(state.game, initialPlayer.object),
    deaths: initialPlayer.deaths + 1,
  };

  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: player,
      },
    },
    effects.MessageConnections({
      connections: state.network.connections,
      payload: {
        type: 'player.update',
        player,
      },
    }),
  ];
};

export const StartCharacterSelect = (state) => ({
  ...state,
  view: 'characterSelect',
});


export const StartGame = (state) => {
  const localIds = Object.keys(state.controls);
  const players = localIds.reduce((players, id) => ({
    ...players,
    [id]: {
      ...players[id],
      active: true,
    },
  }), state.players);

  return [
    {
      ...state,
      players,
      view: 'game',
    },
    [
      effects.Declarativas({
        state,
        AfterRenderAction: Render,
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

export const PlayerRemove = (state, { id }) => ({
  ...state,
  players: omit(id, state.players),
});

export const PlayerInputChange = (state, {
  id,
  inputKey,
  value,
}) => {
  const prevPlayer = state.players[id];
  let playerAnimation = prevPlayer.animation;

  const didPunch = inputKey === 'punch' && value > 0 && prevPlayer.inputs.punch === 0;
  const targetIds = prevPlayer.targets.map(t => t.id);

  if (didPunch && playerAnimation.name !== 'attack1') {
    playerAnimation = animation.make(
      'attack1',
      state.spriteSheets[prevPlayer.character].attack1.frames,
      0.06,
    );
  }

  const punchEffects = didPunch
    ? effects.Punch({ sourceId: id, targetIds, OnPunch: PlayerGetPunched })
    : [];

  const isLocal = !!state.controls[id];

  const player = {
    ...prevPlayer,
    animation: playerAnimation,
    inputs: {
      ...state.players[id].inputs,
      [inputKey]: value,
    },
  };

  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: player,
      },
    },
    [
      punchEffects,
      isLocal && [
        effects.MessageConnections({
          connections: state.network.connections,
          payload: {
            type: 'player.inputs.update',
            id,
            inputKey,
            value,
          },
        }),
        effects.MessageConnections({
          connections: state.network.connections,
          payload: {
            type: 'player.update',
            player,
          },
        }),
      ],
    ],
  ];
};

export const PlayerGetPunched = (state, { id, sourceId }) => {
  const player = state.players[id];
  const sourcePlayer = state.players[sourceId];
  const force = physics.vec.add(
    physics.vec.make(
      sourcePlayer.object.punch.x * (sourcePlayer.object.isFacingRight ? 1 : -1),
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
      object: physics.dynamic.applyInputs(player.inputs, player.animation.name.startsWith('attack'), player.object),
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

  const idsToKill = players
    .filter(p => (
      p.object.position.y > (state.canvas.height + (p.object.size.y * 2))
      && p.object.speed.y === 20
      && !!state.controls[p.id]
    ))
    .map(p => p.id);

  players = players.reduce((nextPlayers, p) => ({
    ...nextPlayers,
    [p.id]: {
      ...p,
      deaths: idsToKill.includes(p.id) ? p.deaths + 1 : p.deaths,
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

export const NetworkInitialize = (state, {
  joinGameId,
}) => {
  const id = Math.random().toString(36).slice(2);

  return [
    {
      ...state,
      network: {
        ...state.network,
        id,
        peer: null,
        connections: [],
      },
    },
    effects.NetworkCreatePeer({
      id,
      joinGameId,
      AfterCreate: NetworkSetPeer,
    }),
  ];
};

export const NetworkSetPeer = (state, { peer, joinGameId }) => [
  {
    ...state,
    network: {
      ...state.network,
      peer,
    },
    view: 'characterSelect',
  },
  effects.NetworkConnectPeer({
    peer,
    joinGameId,
    OnAddConnection: NetworkClientAdd,
  }),
];

export const NetworkUnsetPeer = (state) => ({
  ...state,
  network: {
    ...state.network,
    peer: null,
    dataConnection: null,
  },
});

export const NetworkConnect = (state, { id }) => [
  state,
  state.network.connections.every((c) => c.id !== id) && (
    effects.NetworkConnectPeer({
      peer: state.network.peer,
      joinGameId: id,
      OnAddConnection: NetworkClientAdd,
    })
  ),
];

export const NetworkClientAdd = (state, { client }) => [
  {
    ...state,
    network: {
      ...state.network,
      connections: state.network.connections.concat({
        id: Peer.simplifyId(client.peer),
        client,
      }),
    },
  },
  effects.MessageConnections({
    connections: [
      { client },
    ],
    payload: {
      type: 'peers.index',
      ids: state.network.connections.map(c => Peer.simplifyId(c.client.peer)),
    },
  }),
];

export const NetworkClientRemove = (state, { connection }) => ({
  ...state,
  network: {
    ...state.network,
    connections: state.network.connections.filter((c) => c.client !== connection.client),
  },
});

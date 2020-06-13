import randomColor from 'randomcolor';

import * as effects from './effects';
import * as physics from './physics';
import * as animation from './animation';

import * as level from './levels/demo';

const omit = (key, object) => {
  const { [key]: _discard, ...nextObject } = object;
  return nextObject;
};

const ArrowKeyBinds = {
  'ArrowUp': 'jump',
  'ArrowLeft': 'left',
  'ArrowRight': 'right',
  'Slash': 'punch',
  // 'Period': 'kick',
};

const WasdKeyBinds = {
  'KeyW': 'jump',
  'KeyA': 'left',
  'KeyD': 'right',
  'KeyF': 'punch',
  // 'KeyE': 'kick',
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
    Arrows: ArrowKeyBinds,
    WASD: WasdKeyBinds,
  },
  characterSelection: {
    color: randomColor(),
    name: '',
    keybind: '',
    gamepadIndex: null,
  },
  connections: [],
  network: {
    isInitialized: false,
    isHost: false,
    isReady: false,
    joinGameId: '',
    peer: null,
    dataConnection: null,
    clients: [],
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
    state.network.isHost
      ? effects.HostMessageClients({
        clients: state.network.clients,
        payload: {
          players,
        },
      })
      : effects.ClientMessageHost({
        dataConnection: state.network.dataConnection,
        payload: {
          type: 'setPlayer',
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
    name,
    character,
    isFacingRight: object.position.x < (state.canvas.width / 2),
    punchCountdown: null,
    inputs: {
      horizontal: 0,
      punch: 0,
      jump: 0,
    },
    animation: {
      type: 'idle',
      millisecondsPerFrame: 250,
      frame: 0,
      time: 0,
    },
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

export const PlayersUpdateFromHost = (state, { players }) => ({
  ...state,
  players,
});

export const HostClientAddPlayer = (state, { player }) => {
  const players = {
    ...state.players,
    [player.id]: player,
  };

  return [
    {
      ...state,
      players,
    },
    effects.HostMessageClients({
      clients: state.network.clients,
      payload: {
        players,
      },
    }),
  ];
};

export const StartCharacterSelect = (state) => ({
  ...state,
  view: 'characterSelect',
});


export const StartGame = (state) => {
  return [
    {
      ...state,
      view: 'game',
    },
    [
      effects.Declarativas({
        state,
        AfterRenderAction: Render,
      }),
      effects.HostMessageClients({
        clients: state.network.clients,
        payload: {
          type: 'startGame',
        },
      }),
    ],
  ];
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
  // const parent = state.spriteSheets[player.character];

  const didPunch = inputKey === 'punch' && value > 0 && player.inputs.punch === 0;
  const targetIds = player.targets.map(t => t.id);

  const punchEffects = didPunch
    ? effects.Punch({ sourceId: id, targetIds, OnPunch: PlayerGetPunched })
    : [];

  //let playerAnimation = player.animation;
  //let punchCountdown = player.punchCountdown;
  //if (didPunch) {
    //punchCountdown = 0.2;
    //playerAnimation = animation.makeAttack(
      //'attack1',
      //parent.attack1,
      //player.animation,
    //);
  //} else if (playerAnimation.name.startsWith('attack')) {
    //// Noop
  //} else if (inputKey === 'horizontal' && value === 0) {
    //playerAnimation = animation.makeIdle(parent.idle);
  //} else if (inputKey === 'horizontal' && value !== 0) {
    //playerAnimation = animation.makeRun(parent.run);
  //}

  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: {
          ...player,
          punchCountdown: player.punchCountdown > 0 ? player.punchCountdown : 0,
          isFacingRight: inputKey === 'horizontal' && value !== 0
            ? value > 0
            : player.isFacingRight,
          // animation: playerAnimation,
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
      // animation: animation.step(delta, p, p.animation),
      deaths: idsToKill.includes(p.id) ? p.deaths + 1 : p.deaths,
      object: idsToKill.includes(p.id) ? physics.dynamic.reset(state.game, p.object) : p.object,
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
        state,
        AfterRenderAction: Render,
      }),
      effects.HostMessageClients({
        clients: state.network.clients,
        players: nextState.players,
      }),
    ]
  ]
};

export const NetworkInitialize = (state, { joinGameId: joinGameIdInit }) => {
  const joinGameId = (joinGameIdInit || '').toUpperCase();
  const isHost = !joinGameIdInit;

  return {
    ...state,
    network: {
      ...state.network,
      isInitialized: true,
      isHost,
      isReady: false,
      joinGameId,
      peer: null,
    },
  };
};

export const NetworkSetHostPeer = (state, { peer }) => ({
  ...state,
  network: {
    ...state.network,
    peer,
    isReady: true,
  },
  view: 'characterSelect',
});

export const NetworkSetClientPeer = (state, { peer, dataConnection }) => ({
  ...state,
  network: {
    ...state.network,
    peer,
    dataConnection,
    isReady: true,
  },
  view: 'characterSelect',
});

export const NetworkUnsetPeer = (state) => ({
  ...state,
  network: {
    ...state.network,
    isInitialized: false,
    isReady: false,
    joinGameId: '',
    peer: null,
    dataConnection: null,
  },
});

export const NetworkClientAdd = (state, { client }) => ({
  ...state,
  network: {
    ...state.network,
    clients: state.network.clients.concat(client),
  },
});

export const NetworkClientRemove = (state, { client }) => ({
  ...state,
  network: {
    ...state.network,
    clients: state.network.clients.concat(client),
  },
});

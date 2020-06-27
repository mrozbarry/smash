import randomColor from 'randomcolor';

import * as Peer from '../lib/peer';

import * as effects from '../effects';
import * as physics from '../physics';
import * as animation from '../animation';

const omit = (key, object) => {
  const { [key]: _discard, ...nextObject } = object;
  return nextObject;
};

export const state = {
  players: {},
  controls: {},
};

const _PlayerChange = (id, mutation, state) => {
  const player = mutation(state.players[id]);
  const players = {
    ...state.players,
    [id]: player,
  };

  return [
    {
      ...state,
      players,
    },
    effects.MessageClients({
      clients: state.network.clients,
      payload: {
        type: 'player.update',
        player,
      },
    }),
  ];
}

export const PlayerShareLocalsWithClient = (state, {
  client,
}) => {
  const localPlayers = Object.keys(state.controls)
    .map((id) => state.players[id]);

  return [
    state,
    effects.MessageClients({
      clients: [client],
      payload: {
        type: 'players.update',
        players: localPlayers,
      },
    }),
  ];
};

export const PlayerAdd = (state, {
  keybind,
  gamepadIndex,
  color,
  name,
}) => {
  const id = Math.random().toString(36).slice(2);

  const object = physics.dynamic.reset(
    state.game,
    physics.dynamic.make(
      physics.vec.make(
        90,
        90,
      ),
    ),
  );

  const character = 'woodcutter';

  const player = {
    id,
    peerId: Peer.simplifyId(state.network.peer.id),
    ready: false,
    dead: true,
    name,
    character,
    inputs: {
      horizontal: 0,
      punch: 0,
      jump: 0,
      run: 0,
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

export const PlayerMerge = (state, { player, peerId }) => {
  const players = {
    ...state.players,
    [player.id]: {
      ...player,
    },
  };

  return {
    ...state,
    players,
  };
};

export const PlayerRemoveByPeerId = (state, { peerId }) => ({
  ...state,
  players: Object.keys(state.players).reduce((players, id) => ({
    ...players,
    ...(state.players[id].peerId === peerId
      ? {}
      : { [id]: state.players[id] }
    ),
  }), {}),
});

export const PlayerRespawn = (state, { id }) => {
  const initialPlayer = state.players[id];
  if (!initialPlayer) return state;

  const player = {
    ...initialPlayer,
    object: physics.dynamic.reset(state.game, initialPlayer.object),
    dead: false,
  };

  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: player,
      },
    },
    effects.MessageClients({
      clients: state.network.clients,
      payload: {
        type: 'player.update',
        player,
      },
    }),
  ];
};

export const PlayerRemove = (state, { id }) => [
  {
    ...state,
    players: omit(id, state.players),
  },
  effects.MessageClients({
    clients: state.network.clients,
    payload: {
      type: 'player.remove',
      playerId: id,
    },
  }),
];

export const PlayerInputChange = (state, {
  id,
  inputKey,
  value,
}) => {
  const prevPlayer = state.players[id];
  let playerAnimation = prevPlayer.animation;
  let object = prevPlayer.object;

  const didPunch = inputKey === 'punch' && value > 0 && prevPlayer.inputs.punch === 0;
  const targetIds = prevPlayer.targets.map(t => t.id);

  if (didPunch && !object.isAttacking) {
    let attackName = object.isRunning || Math.abs(prevPlayer.inputs.horizontal) < 0.01
      ? 'attack2'
      : 'attack3';
    if (!object.isOnGround) {
      attackName = 'attack1';
    }
    playerAnimation = animation.make(
      attackName,
      state.spriteSheets[prevPlayer.character][attackName].frames,
      0.06,
    );
    object = physics.dynamic.attack(
      object.isRunning,
      true,
      object,
    );
  }

  const localTargetIds = targetIds.filter((tId) => state.controls[tId]);
  const networkTargetIds = targetIds.filter((tId) => !state.controls[tId]);

  let punchEffects = []

  if (didPunch) {
    punchEffects = [
      effects.Punch({ sourceId: id, targetIds: localTargetIds, OnPunch: PlayerGetPunched }),
      effects.MessageClients({
        clients: state.network.clients,
        payload: {
          type: 'player.punch',
          sourceId: id,
          targetIds: networkTargetIds,
        },
      }),
    ];
  }

  const isLocal = !!state.controls[id];

  const player = {
    ...prevPlayer,
    animation: playerAnimation,
    inputs: {
      ...state.players[id].inputs,
      [inputKey]: value,
    },
    object,
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
        effects.MessageClients({
          clients: state.network.clients,
          payload: {
            type: 'player.inputs.update',
            id,
            inputKey,
            value,
          },
        }),
        effects.MessageClients({
          clients: state.network.clients,
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
  if (!state.controls[id]) {
    return state;
  }

  const prevHitPlayer = state.players[id];
  const sourcePlayer = state.players[sourceId];
  const force = physics.vec.add(
    physics.vec.make(
      sourcePlayer.object.punch.x * (sourcePlayer.object.isFacingRight ? 1 : -1),
      sourcePlayer.object.punch.y,
    ),
    sourcePlayer.object.speed,
  );

  const hitPlayer = {
    ...prevHitPlayer,
    object: physics.dynamic.applyForce(force, prevHitPlayer.object),
  };


  return [
    {
      ...state,
      players: {
        ...state.players,
        [id]: hitPlayer,
      },
    },
    effects.MessageClients({
      clients: state.network.clients,
      payload: {
        type: 'player.update',
        player: hitPlayer,
      },
    }),
  ];
};

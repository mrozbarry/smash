import randomColor from 'randomcolor';

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
    effects.MessageConnections({
      connections: state.network.connections,
      payload: {
        type: 'player.update',
        player,
      },
    }),
  ];
}

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
    // deaths: initialPlayer.deaths + 1,
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
    effects.MessageConnections({
      connections: state.network.connections,
      payload: {
        type: 'player.update',
        player,
      },
    }),
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
  let object = prevPlayer.object;

  const didPunch = inputKey === 'punch' && value > 0 && prevPlayer.inputs.punch === 0;
  const targetIds = prevPlayer.targets.map(t => t.id);

  if (didPunch && !object.isAttacking) {
    let attackName = 'attack3';
    if (!object.isOnGround) {
      attackName = 'attack1';
    } else if (object.isRunning) {
      attackName = 'attack2';
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

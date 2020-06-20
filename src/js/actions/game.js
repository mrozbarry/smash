import * as effects from '../effects';

import * as physics from '../physics';

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

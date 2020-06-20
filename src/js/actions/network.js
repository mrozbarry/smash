import * as effects from '../effects';

import * as Peer from '../lib/peer';

export const state = {
  network: {
    id: null,
    peer: null,
    connections: [],
  },
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

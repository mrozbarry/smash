import * as effects from '../effects';

import * as Peer from '../lib/peer';

export const state = {
  network: {
    id: null,
    peer: null,
    clients: [],
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
        clients: [],
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
    view: 'characterSelect', // TODO: Move to some other spot
  },
  effects.NetworkConnectPeer({
    peer,
    joinGameId,
    NetworkClientAdd,
  }),
];

export const NetworkUnsetPeer = (state) => [
  {
    ...state,
    network: {
      ...state.network,
      peer: null,
    },
  },
  effects.NetworkDestroyPeer({
    peer: state.network.peer,
  }),
];

export const NetworkClientConnect = (state, { id }) => [
  state,
  state.network.clients.some(client => client.peer === id) && (
    effects.NetworkConnectPeer({
      peer: state.network.peer,
      joinGameId: Peer.simplifyId(id),
      NetworkClientAdd,
    })
  ),
];

export const NetworkClientAdd = (state, { client }) => [
  {
    ...state,
    network: {
      ...state.network,
      clients: state.network.clients.concat(client),
    },
  },
  state.network.clients.length > 0 && [
    effects.MessageClients({
      clients: [client],
      payload: {
        type: 'peers.index',
        ids: state.network.clients.map((c) => c.peer),
      },
    }),
  ],
];

export const NetworkClientRemove = (state, { id }) => [
  {
    ...state,
    network: {
      ...state.network,
      clients: state.network.clients.filter((c) => (
        Peer.simplifyId(c.peer) !== id
      )),
    },
  },
  state.network.clients
    .filter((client) => (
      Peer.simplifyId(client.peer) === id
    ))
    .map((client) => (
      effects.NetworkCloseDataConnection({ client })
    )),
];

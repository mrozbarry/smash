import * as Peer from '../lib/peer';

const DataConnectionHandlerFX = (dispatch, {
  client,
  actions,
}) => {
  const d = (action, props) => requestAnimationFrame(() => dispatch(action, props));

  const onData = (stringData) => {
    const data = JSON.parse(stringData);
    switch (data.type) {
    case 'player.update':
      return dispatch(actions.PlayerMerge, {
        player: data.player,
      });

    case 'players.update':
      return data.players.forEach((player) => dispatch(
        actions.PlayerMerge,
        { player },
      ));

    case 'player.inputs.update':
      return dispatch(actions.PlayerInputChange, {
        id: data.id,
        inputKey: data.inputKey,
        value: data.value,
      });

    case 'player.punch':
      for (const id of data.targetIds) {
        dispatch(actions.PlayerGetPunched, {
          sourceId: data.sourceId,
          id,
        });
      }
      return;

    case 'peers.index':
      for (const id of data.ids) {
        dispatch(actions.NetworkClientConnect, { id });
      }
      return;

    default:
      console.warn('Unknown type', data.type);
    }
  };

  const close = () => {
    const id = Peer.simplifyId(client.peer);
    d(actions.PlayerRemoveByPeerId, { peerId: id });
    d(actions.NetworkClientRemove, { id });
  };

  const onClose = () => {
    close();
  };

  const onError = (error) => {
    close();
  };

  client.on('data', onData);
  client.on('close', onClose);
  client.on('error', onError);

  return () => {
    client.off('data', onData);
    client.off('close', onClose);
    client.off('error', onError);
  };
};
export const DataConnectionHandler = props => [DataConnectionHandlerFX, props];

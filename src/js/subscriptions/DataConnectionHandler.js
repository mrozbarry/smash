import * as Peer from '../lib/peer';

const DataConnectionHandlerFX = (dispatch, {
  client,
  actions,
}) => {
  const d = (action, props) => requestAnimationFrame(() => dispatch(action, props));

  const onData = (stringData) => {
    const data = JSON.parse(stringData);
    console.log('onData', {
      data,
      stringData,
    });
    switch (data.type) {
    case 'player.update':
      return dispatch(actions.PlayerMerge, {
        player: data.player,
      });

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
      console.log('Unknown type', data.type);
    }
  };

  const close = () => {
    const id = Peer.simplifyId(client.peer);
    d(actions.PlayerRemoveByPeerId, { peerId: id });
    d(actions.NetworkClientRemove, { id });
  };

  const onClose = () => {
    console.warn('Peer.connection close', client);
    close();
  };

  const onError = (error) => {
    console.warn('Peer.connection error', client, error);
    close();
  };

  client.on('data', onData);
  client.on('close', onClose);
  client.on('error', onError);

  return () => {
    console.log('DataConnectionHandler.cancel', client);
    client.off('data', onData);
    client.off('close', onClose);
    client.off('error', onError);
  };
};
export const DataConnectionHandler = props => [DataConnectionHandlerFX, props];

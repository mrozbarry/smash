const PeerJSHandlerFX = (dispatch, {
  peer,
  actions,
}) => {
  const onConnection = (client) => {
    const onOpen = () => {
      dispatch(
        actions.NetworkClientAdd,
        { client },
      );

      dispatch(
        actions.PlayerShareLocalsWithClient,
        { client },
      );
    };

    client.on('open', onOpen);
  };

  const onDisconnected = () => {
    console.warn('PeerHostFX.disconnected', peer);
  };

  const onError = (error) => {
    console.warn('PeerHostFX.error', peer, error);
  };

  peer.on('connection', onConnection);
  peer.on('disconnected', onDisconnected);
  peer.on('error', onError);

  return () => {
    peer.off('connection', onConnection);
    peer.off('disconnected', onDisconnected);
    peer.off('error', onError);
  };
};
export const PeerJSHandler = props => [PeerJSHandlerFX, props];

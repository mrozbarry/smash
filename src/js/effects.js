import * as declarativas from 'declarativas';
import * as canvas from './canvas';
import * as Peer from './lib/peer';


const DeclarativasFX = (dispatch, {
  state,
  AfterRenderAction,
}) => {
  requestAnimationFrame(() => {
    if (state.canvas.context) {
      declarativas.render(
        state.canvas.context,
        canvas.view(state),
      );
    }

    dispatch(AfterRenderAction);
  });
};
export const Declarativas = props => [DeclarativasFX, props];


const LoadSpriteSheetFx = (dispatch, {
  character,
  type,
  uri,
  size,
  OnLoad,
  OnReady,
}) => {
  const image = new Image();

  image.onload = () => {
    dispatch(OnReady, {
      character,
      type,
      image,
      frames: image.width / 48,
    });
  };

  image.onerror = (error) => {
    console.error('Unable to load image', { character, type, uri }, error);
  };

  image.src = uri;

  dispatch(OnLoad, {
    character,
    type,
    size,
  });
};
export const LoadSpriteSheet = props => [LoadSpriteSheetFx, props];

export const LoadSpritesForCharacter = props => [
  'idle',
  'run',
  'attack1',
  'attack2',
].map((type) => LoadSpriteSheet({
  ...props,
  character: props.character.toLowerCase(),
  type,
  uri: props.assetCollection[`${props.character}_${type}`],
}));


const PunchFX = (dispatch, {
  sourceId,
  targetIds,
  OnPunch,
}) => {
  for(const id of targetIds) {
    dispatch(OnPunch, { id, sourceId }); 
  }
};
export const Punch = props => [PunchFX, props];


const RumbleGamepadFX = (_dispatch, { gamepad }) => {
  const actuators = Array.from(gamepad.hapticActuators || []);
  for (const actuator of actuators) {
    actuator.pulse();
  }
};
export const RumbleGamepad = props => [RumbleGamepadFX, props];


const NetworkCreatePeerFX = (dispatch, {
  id,
  AfterCreate,
}) => {
  const peer = Peer.make(id);

  const onOpen = () => {
    dispatch(AfterCreate, { peer });
    peer.off('open', onOpen);
  };

  peer.on('open', onOpen);
};
export const NetworkCreatePeer = props => [NetworkCreatePeerFX, props];


const NetworkConnectPeerFX = (dispatch, {
  joinGameId,
  peer,
  OnAddConnection,
}) => {
  if (!joinGameId) return;

  const client = peer.connect(Peer.id(joinGameId));
  const onOpen = () => {
    dispatch(OnAddConnection, { client });
    client.off('open', onOpen);
  };
  client.on('open', onOpen);
};
export const NetworkConnectPeer = props => [NetworkConnectPeerFX, props];


const ClientMessageHostFX = (_dispatch, {
  dataConnection,
  payload,
}) => {
  if (dataConnection) {
    dataConnection.send(payload);
  }
};
export const ClientMessageHost = props => [ClientMessageHostFX, props];

const MessageConnectionsFX = (_dispatch, {
  connections,
  payload,
}) => {
  for(const connection of connections) {
    connection.client.send(payload);
  }
};
export const MessageConnections = props => [MessageConnectionsFX, props];

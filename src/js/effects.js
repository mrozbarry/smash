import * as declarativas from 'declarativas';
import * as canvas from './canvas';
import * as Peer from './lib/peer';


const DeclarativasFX = (dispatch, {
  state,
  AfterRenderAction,
  OnRespawn,
}) => {
  requestAnimationFrame(() => {
    if (state.canvas.context) {
      declarativas.render(
        state.canvas.context,
        canvas.view(state),
      );
    }

    dispatch(AfterRenderAction, { OnRespawn });
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

  requestAnimationFrame(() => {
    dispatch(OnLoad, {
      character,
      type,
      size,
    });
  });
};
export const LoadSpriteSheet = props => [LoadSpriteSheetFx, props];


const animationMap = {
  'idle': 'idle',
  'walk': 'walk',
  'run': 'run',
  'attack1': 'attack1',
  'attack2': 'attack2',
  'attack3': 'attack3',
};

export const LoadSpritesForCharacter = props => Object.keys(
  animationMap,
).map((type) => LoadSpriteSheet({
  ...props,
  character: props.character.toLowerCase(),
  type,
  uri: props.assetCollection[`${props.character}_${animationMap[type]}`],
}));


const PunchFX = (dispatch, {
  sourceId,
  targetIds,
  OnPunch,
}) => {
  requestAnimationFrame(() => {
    for(const id of targetIds) {
      dispatch(OnPunch, { id, sourceId }); 
    }
  });
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
  joinGameId,
  AfterCreate,
}) => {
  const peer = Peer.make(id);

  const onOpen = () => {
    dispatch(AfterCreate, { peer, joinGameId });
    peer.off('open', onOpen);
  };

  peer.on('open', onOpen);
};
export const NetworkCreatePeer = props => [NetworkCreatePeerFX, props];


const NetworkConnectPeerFX = (dispatch, {
  peer,
  joinGameId,
  NetworkClientAdd,
}) => {
  if (!joinGameId) return;

  const client = peer.connect(
    Peer.id(joinGameId),
    {
      serialization: 'none',
    },
  );
  const onOpen = () => {
    dispatch(NetworkClientAdd, { client });
    client.off('open', onOpen);
  };
  client.on('open', onOpen);
};
export const NetworkConnectPeer = props => [NetworkConnectPeerFX, props];


const NetworkDestroyPeerFX = (_dispatch, {
  peer,
}) => {
  peer.destroy();
};
export const NetworkDestroyPeer = props => [NetworkDestroyPeerFX, props];


const NetworkCloseDataConnectionFX = (_dispatch, {
  client,
}) => {
  if (client.open) client.close();
};
export const NetworkCloseDataConnection = props => [NetworkCloseDataConnectionFX, props];


const MessageClientsFX = (_dispatch, {
  clients,
  payload,
}) => {
  const data = JSON.stringify(payload);
  for(const client of clients) {
    if (!client.open) {
      continue;
    }
    client.send(data);
  }
};
export const MessageClients = props => [MessageClientsFX, props];

const RespawnPlayerFX = (dispatch, {
  id,
  PlayerReset,
}) => {
  setTimeout(() => {
    dispatch(PlayerReset, { id });
  }, 1500);
};
export const RespawnPlayer = props => [RespawnPlayerFX, props];

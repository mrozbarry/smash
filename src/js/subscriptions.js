import * as Peer from './lib/peer';

const CanvasContextSub = (dispatch, {
  canvasQuerySelector,
  SetContext,
}) => {
  const attemptToGetContext = () => {
    const canvas = document.querySelector(canvasQuerySelector);
    if (!canvas) {
      return requestAnimationFrame(attemptToGetContext);
    }
    dispatch(SetContext, canvas.getContext('2d'));
  };

  requestAnimationFrame(attemptToGetContext);

  return () => {
    dispatch(SetContext, null);
  };
};
export const CanvasContext = props => [CanvasContextSub, props];


const KeyboardPlayerSub = (dispatch, {
  id,
  keybinds,
  OnInputChange,
}) => {
  let state = {
    up: { value: 0, key: 'vertical' },
    down: { value: 0, key: 'vertical' },
    left: { value: 0, key: 'horizontal' },
    right: { value: 0, key: 'horizontal' },
  };

  const update = (keybind, value) => ({
    ...state,
    [keybind]: {
      ...state[keybind],
      value,
    },
  });

  const parent = document;

  const keyHandler = (defaultValue) => (event) => {
    const keybind = keybinds[event.code];
    if (keybind) {
      event.preventDefault();
    }

    if (event.repeat) {
      return;
    }

    let inputKey = keybind;
    let value = defaultValue;

    if (keybind in state) {
      state = update(keybind, defaultValue);
      inputKey = state[keybind].key;
      switch (keybind) {
      case 'up':
      case 'down':
        value = state.up.value - state.down.value;
        break;
      case 'left':
      case 'right':
        value = state.right.value - state.left.value;
        break;
      }
    }

    dispatch(OnInputChange, {
      id,
      inputKey,
      value,
    });
  };

  const keyup = keyHandler(0);
  const keydown = keyHandler(1);

  parent.addEventListener('keyup', keyup);
  parent.addEventListener('keydown', keydown);

  return () => {
    parent.removeEventListener('keyup', keyup);
    parent.removeEventListener('keydown', keydown);
  };
};
export const KeyboardPlayer = props => [KeyboardPlayerSub, props];

const GamepadPlayerSubFX = (dispatch, {
  id,
  gamepadIndex,
  OnInputChange,
}) => {
  let lastChange = performance.now();
  let running = true;
  let handle = null;

  let state = {
    horizontalStick: 0,
    horizontalDPad: 0,
    jump: 0,
    punch: 0,
    run: 0,
  };

  const threshold = (min, value) => Math.abs(value) >= min ? Math.sign(value): 0;

  const binds = [
    {
      inputKey: 'horizontalStick',
      value: (gamepad) => threshold(0.2, gamepad.axes[0]),
    },
    {
      inputKey: 'horizontalDPad',
      value: (gamepad) => gamepad.axes[6],
    },
    {
      inputKey: 'jump',
      value: (gamepad) => gamepad.buttons[0].value,
    },
    {
      inputKey: 'punch',
      value: (gamepad) => gamepad.buttons[2].value,
    },
    {
      inputKey: 'run',
      value: (gamepad) => (
        gamepad.buttons[5].value > 0
        || gamepad.buttons[5].value > 0
      ),
    },
  ];

  const update = (inputKey, value) => {
    const changes = state[inputKey] !== value
      ? [{ id, inputKey, value }]
      : [];
    state = { ...state, [inputKey]: value };
    return changes;
  };

  const checkGamepad = () => {
    if (!running) {
      return;
    }

    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad || gamepad.timestamp === lastChange) {
      handle = requestAnimationFrame(checkGamepad);
      return;
    }

    const prevState = { ...state };
    let changes = binds
      .reduce((toChange, bind) => [
        ...toChange,
        ...update(bind.inputKey, bind.value(gamepad)),
      ], []);

    if (prevState.horizontalDPad !== state.horizontalDPad || prevState.horizontalStick !== state.horizontalStick) {
      changes = changes
        .filter(c => c.inputKey === 'horizontalStick' || c.inputKey === 'horizontalDPad')
        .concat({
          id,
          inputKey: 'horizontal',
          value: state.horizontalDPad || state.horizontalStick || 0,
        });
    }

    for (const change of changes) {
      dispatch(OnInputChange, change);
    }

    lastChange = gamepad.timestamp;
    handle = requestAnimationFrame(checkGamepad);
  };

  requestAnimationFrame(checkGamepad);

  return () => {
    running = false;
    cancelAnimationFrame(handle);
  };
};
export const GamepadPlayer = props => [GamepadPlayerSubFX, props];

const GamepadConnectionsFX = (dispatch, { OnGamepadsChange }) => {
  const onChange = (event) => {
    dispatch(
      OnGamepadsChange,
      Array.from(navigator.getGamepads()),
    );
  };

  window.addEventListener('gamepadconnected', onChange);
  window.addEventListener('gamepaddisconnected', onChange);

  return () => {
    window.removeEventListener('gamepadconnected', onChange);
    window.removeEventListener('gamepaddisconnected', onChange);
  };
};
export const GamepadConnections = props => [GamepadConnectionsFX, props];

const PeerConnectionFX = (dispatch, {
  connection,
  ClientRemove,
  ClientAddPlayer,
  ClientSetPlayerInputs,
  ClientPlayerPunch,
  AddConnection,
}) => {
  let ids = [];
  const onData = (data) => {
    switch (data.type) {
    case 'player.update':
      ids = Array.from(new Set(ids.concat(data.player.id)));
      return dispatch(ClientAddPlayer, {
        player: data.player,
      });

    case 'player.inputs.update':
      return dispatch(ClientSetPlayerInputs, {
        id: data.id,
        inputKey: data.inputKey,
        value: data.value,
      });

    case 'player.punch':
      for (const id of data.targetIds) {
        dispatch(ClientPlayerPunch, {
          sourceId: data.sourceId,
          id,
        });
      }
      return;

    case 'peers.index':
      for (const id of data.ids) {
        dispatch(AddConnection, { id });
      }
      return;

    default:
      console.log('Unknown type', data.type);
    }
  };

  const onClose = () => {
    connection.client.close();
    dispatch(ClientRemove, { connection });
  };

  const onError = (error) => {
    console.warn('Host.connection error', connection, error);
    connection.client.close();
    dispatch(ClientRemove, { connection });
  };

  connection.client.on('data', onData);
  connection.client.on('close', onClose);
  connection.client.on('error', onError);

  return () => {
    connection.client.off('data', onData);
    connection.client.off('close', onClose);
    connection.client.off('error', onError);
  };
};
export const PeerConnection = props => [PeerConnectionFX, props];


const PeerHandlerFX = (dispatch, {
  peer,
  ClientAdd,
  ShareLocalPlayers,
  OnDone,
}) => {
  const onConnection = (client) => {
    client.on('open', () => {
      requestAnimationFrame(() => {
        dispatch(ClientAdd, { client })
        dispatch(ShareLocalPlayers, { connection: { client } });
      });
    });
  };

  const onDisconnected = () => {
    console.warn('PeerHostFX.disconnected', peer);
    peer.reconnect();
  };

  const onError = (error) => {
    console.warn('PeerHostFX.error', peer, error);
  };

  peer.on('connection', onConnection);
  peer.on('disconnected', onDisconnected);
  peer.on('error', onError);

  return () => {
    console.log('PeerHostFX.cancel', peer);
    peer.off('connection', onConnection);
    peer.off('disconnected', onDisconnected);
    peer.off('error', onError);
    peer.destroy();
    requestAnimationFrame(() => dispatch(OnDone));
  };
};
export const PeerHandler = props => [PeerHandlerFX, props];

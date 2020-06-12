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
  name,
  color,
  keybinds,
  character,
  OnAdd,
  OnRemove,
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

  requestAnimationFrame(() => dispatch(OnAdd, {
    id,
    name,
    color,
    keybinds,
    character,
  }));

  return () => {
    parent.removeEventListener('keyup', keyup);
    parent.removeEventListener('keydown', keydown);
    requestAnimationFrame(() => dispatch(OnRemove, { id }));
  };
};
export const KeyboardPlayer = props => [KeyboardPlayerSub, props];

const GamepadPlayerSub = (dispatch, {
  id,
  name,
  color,
  character,
  gamepadIndex,
  OnAdd,
  OnRemove,
  OnInputChange,
}) => {
  let lastChange = performance.now();
  let running = true;
  let handle = null;

  let state = {
    horizontal: 0,
    jump: 0,
    punch: 0,
  };

  const binds = [
    {
      inputKey: 'horizontal',
      value: (gamepad) => Math.abs(gamepad.axis[0]) > 0.15
        ? gamepad.axis[0]
        : 0,
    },
    {
      inputKey: 'horizontal',
      value: (gamepad) => Math.abs(gamepad.axis[6]) > 0.15
        ? gamepad.axis[0]
        : 0,
    },
    {
      inputKey: 'jump',
      value: (gamepad) => gamepad.buttons[0],
    },
    {
      inputKey: 'punch',
      value: (gamepad) => gamepad.buttons[2],
    },
  ];

  const update = (inputKey, value) => {
    const changes = state[inputKey] !== value
      ? [{ id, inputKey, value }]
      : [];
    state = { ...state, [inputKey]: value };
    return changes;
  };

  const keybinds = {
    'A': 'jump',
    'X': 'punch',
    'DPad Left|Right Joystick X Axis': 'left',
    'DPad Right|Right Joystick X Axis': 'right',
  };

  const checkGamepad = () => {
    if (!running) {
      return;
    }

    const gamepad = navigator.getGamepads()[gamepadIndex];
    if (!gamepad || gamepad.timestamp === lastChange) {
      return;
    }

    const changes = binds.reduce((toChange, bind) => [
      ...toChange,
      ...update(bind.inputKey, bind.value(gamepad)),
    ], []);

    for(const change of changes) {
      dispatch(OnInputChange, change);
    }

    lastChange = gamepad.timestamp;
    handle = requestAnimationFrame(checkGamepad);
  };

  requestAnimationFrame(() => {
    dispatch(OnAdd, {
      id,
      name,
      color,
      keybinds,
      character,
    });

    checkGamepad();
  });

  return () => {
    running = false;
    cancelAnimationFrame(handle);
    requestAnimationFrame(() => dispatch(OnRemove, { id }));
  };
};
export const GamepadPlayer = props => [GamepadPlayerSub, props];

const GamepadConnectionsFX = (dispatch, { OnGamepadsChange }) => {
  const onChange = (event) => {
    console.log('Gamepads Changed');
    //dispatch(
      //OnGamepadsChange,
      //Array.from(navigator.getGamepads()),
    //);
  };

  window.addEventListener('gamepadconnected', console.log);
  // window.addEventListener('gamepaddisconnected', onChange);

  return () => {
    console.log('exiting gamepad listener');
    window.removeEventListener('gamepadconnected', onChange);
    // window.removeEventListener('gamepaddisconnected', onChange);
  };
};
export const GamepadConnections = props => [GamepadConnectionsFX, props];

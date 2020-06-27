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

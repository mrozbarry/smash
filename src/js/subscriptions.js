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
  canvasQuerySelector,
  id,
  color,
  keybinds,
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

  requestAnimationFrame(() => dispatch(OnAdd, { id, color }));

  return () => {
    parent.removeEventListener('keyup', keyup);
    parent.removeEventListener('keydown', keydown);
    requestAnimationFrame(() => dispatch(OnRemove, { id }));
  };
};
export const KeyboardPlayer = props => [KeyboardPlayerSub, props];

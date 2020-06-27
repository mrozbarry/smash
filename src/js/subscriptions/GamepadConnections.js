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


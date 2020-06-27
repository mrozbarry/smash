export { KeyboardPlayer } from './KeyboardPlayer';
export { GamepadPlayer } from './GamepadPlayer';
export { GamepadConnections } from './GamepadConnections';
export { PeerJSHandler } from './PeerJSHandler';
export { DataConnectionHandler } from './DataConnectionHandler';

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

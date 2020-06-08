import * as declarativas from 'declarativas';
import * as canvas from './canvas';


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
  frames,
  rate,
  size,
  OnLoad,
  OnReady,
}) => {
  const image = new Image();

  image.onload = () => {
    dispatch(OnReady, { character, type, image });
  };

  image.onerror = (error) => {
    console.error('Unable to load image', { character, type, uri }, error);
  };

  image.src = uri;

  dispatch(OnLoad, { character, type, frames, rate, size });
};
export const LoadSpriteSheet = props => [LoadSpriteSheetFx, props];

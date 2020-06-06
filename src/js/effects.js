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

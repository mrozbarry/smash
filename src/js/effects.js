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
      ); }

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

export const state = {
  canvas: {
    width: 1280,
    height: 720,
    context: null,
  },
};

export const CanvasSetContext = (state, context) => ({
  ...state,
  canvas: {
    ...state.canvas,
    context,
  },
});


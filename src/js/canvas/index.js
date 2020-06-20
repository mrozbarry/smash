import { c } from 'declarativas';
import { revertableState } from './components/revertableState';
import { staticGeometry } from './components/staticGeometry';
import { player } from './components/player';

const debug = (v) => {
  return v;
};

export const view = (state) => c(revertableState, {}, [
  c('clearRect', {
    x: 0,
    y: 0,
    width: state.canvas.width,
    height: state.canvas.height,
  }),
  c('fillStyle', { value: '#4eacd9' }),
  c('fillRect', {
    x: 0,
    y: 0,
    width: state.canvas.width,
    height: state.canvas.height,
  }),
  c(
    revertableState,
    {}, 
    state.game.geometry.map((geo) => c(
      staticGeometry,
      geo,
    )),
  ),

  Object.values(state.players)
    .map((playerData) => c(
      player,
      debug({
        ...playerData,
        spriteSheet: state.spriteSheets[playerData.character],
        game: state.game,
      }),
    )),
]);

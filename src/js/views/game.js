import { h } from 'hyperapp';

export const game = (state) => h('div', {
  style: {
    display: 'flex',
    flexDirection: 'column',
    margin: '0 auto',
    width: `${state.canvas.width}px`,
  },
}, [
  h('canvas', {
    id: 'canvas',
    width: state.canvas.width,
    height: state.canvas.height,
    style: {
      border: '1px black solid',
      display: 'block',
    },
  }),

  h('div', {
    style: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginTop: '1rem',
    },
  }, Object.values(state.players).map((player) => h('div', {
    style: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '1rem',
      marginRight: '0.5rem',
      border: '1px black solid',
      width: `calc(${state.canvas.width}px / 4)`,
    },
  }, [
    h('div', {
      style: {
        width: '48px',
        height: '48px',
        border: '1px black solid',
        borderRadius: '100%',
        backgroundColor: player.color,
        marginRight: '0.5rem',
      },
    }),
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
      },
    }, [
      player.id,
      h('small', {}, `Died ${player.deaths} time${player.deaths === 1 ? '' : 's'}`),
      h('small', {}, player.targets.map(t => t.id).join(',')),
    ]),
  ]))),
]);

import { h } from 'hyperapp';

const card = ({ state, player, character }) => h('div', {
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
  h('img', {
    src: character,
    height: 48,
    width: 48,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `4px ${player.color} solid`,
      borderRadius: '100%',
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
    player.name,
    h('small', {}, `Died ${player.deaths} time${player.deaths === 1 ? '' : 's'}`),
  ]),
]);

const controls = ({ player }) => h('div', {
  style: {
    display: 'flex',
    flexDirection: 'column',
    margin: '1rem 0',
  },
}, [
  h('strong', {
    style: {
      'text-decoration': 'underline',
    },
  }, `${player.name} controls`),
  Object.keys(player.keybinds || {}).map(k => h('div', {
    style: {
      display: 'block',
    },
  }, [
    h('span', {}, player.keybinds[k]),
    h('strong', {}, `: ${k}`),
  ])),
]);

export const game = ({ state, characters }) => h('div', {
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
  }, Object.values(state.players).map((player) => h(card, { state, player, character: characters[player.character] }))),

  h('div', {}, (
    Object.values(state.players).map((player) => h(controls, { player }))
  )),
]);

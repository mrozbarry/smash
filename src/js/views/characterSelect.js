import { h } from 'hyperapp';

import * as actions from '../actions';
import * as Peer from '../lib/peer';

import { FlexRow } from '../components/FlexRow';
import { CharacterSelectForm } from '../components/CharacterSelectForm';

const playerGrid = (props, children) => h('div', {
  ...props,
  style: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: `repeat(${Math.max(1, Math.floor(children.length / 4))}, 1fr)`,
    gridGap: '0.5rem',
    padding: '1rem',
    ...props.style,
  },
}, children);

const Player = ({ isLocal, characters, ...props }) => {
  const characterOptions = Object.keys(characters);
  const index = characterOptions.indexOf(props.character);
  const prevIndex = index === 0
    ? characterOptions.length - 1
    : index - 1;
  const prevCharacter = characterOptions[prevIndex];
  const nextCharacter = characterOptions[(index + 1) % characterOptions.length];

  return h('div', {
    ...props,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      border: '5px black dashed',
      backgroundColor: `${props.color}22`,
    },
  }, [
    h('div', { style: { flexGrow: 1 } }),
    h('h2', {
      style: {
        padding: 0,
        margin: 0,
      },
    }, props.name),
    h('div', {
      style: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: isLocal ? 'space-between' : 'center',
        width: '100%',
        padding: '0 1rem',
      },
    }, [
      isLocal && h(
        'button',
        {
          type: 'button',
          onclick: [
            actions.PlayerChangeCharacter,
            {
              id: props.id,
              character: prevCharacter,
            },
          ],
        },
        '<-',
      ),

      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }, [
        h('img', {
          src: characters[props.character],
          style: {
            width: '128px',
            height: 'auto',
          },
        }),
        `- ${props.character} -`,
      ]),

      isLocal && h(
        'button',
        {
          type: 'button',
          onclick: [
            actions.PlayerChangeCharacter,
            {
              id: props.id,
              character: nextCharacter,
            },
          ],
        },
        '->',
      ),
    ]),
    h('div', {
      style: {
        padding: '1rem',
      },
    }, [
      h('input', {
        type: 'checkbox',
        id: `ready-${props.id}`,
        checked: props.ready,
        disabled: !isLocal,
        oninput: [
          actions.PlayerReady,
          (event) => ({ id: props.id, ready: event.target.checked }),
        ],
      }),
      h('label', {
        for: `ready-${props.id}`,
      }, 'Ready?'),
    ]),
    h('div', { style: { flexGrow: 1 } }),
    isLocal && h('button', {
      onclick: [
        actions.ConnectionRemove,
        { id : props.id },
      ],
    }, 'Remove'),
  ]);
};

export const characterSelect = ({ state, characters }) => {
  const showStartButton = (
    !state.network.peer
    || state.network.isHost
  );

  return h('div', {
    style: {
      display: 'grid',
      gridTemplateRows: '1fr 8fr 1fr',
      width: `${state.canvas.width}px`,
      height: `${state.canvas.height}px`,
      border: '1px black solid',
      margin: '0 auto',
    },
  }, [
    h(FlexRow, {
      style: {
        backgroundColor: '#eee',
      },
    }, [
      h('h1', {}, 'JS Smash'),
      h('span', {}, [
        'Your join code is ',
        h('span', {
          style: {
            'font-family': 'monospace',
            'font-size': '1.5rem',
            'font-weight': 'bold',
            'text-decoration': 'underline',
          },
        }, state.network.joinGameId || state.network.id),
      ]),
      h('button', {
        onclick: [actions.StartGame, {}],
        disabled: (
          Object.values(state.players).length === 0
          || Object.values(state.players).some(c => !c.ready)
        ),
      }, 'Start Game ->'),
    ]),
    h(playerGrid, {
      style: {
        justifyContent: 'flex-start',
        padding: '1rem',
        overflowY: 'auto',
      },
    }, [
      Object.values(state.players).map((player) => h(
        Player,
        {
          ...player,
          characters,
          isLocal: !!state.controls[player.id],
        },
      )),
      
    ]),
    h(CharacterSelectForm, {
      ...state.characterSelection,
      keybinds: state.keybinds,
      gamepads: state.gamepads,
    }),
  ]);
};

import { h } from 'hyperapp';
import * as actions from '../actions';

const flexRow = (props, children) => h(props.tag || 'div', {
  ...props,
  style: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    ...props.style,
  },
}, children);

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

const placeholder = (props, children) => h('div', {
  ...props,
  style: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    border: '5px black dashed',
  },
}, children);

const player = (props) => {
  const characterOptions = Object.keys(props.characters);
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
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 1rem',
      },
    }, [
      h(
        'button',
        {
          type: 'button',
          onclick: [
            actions.ConnectionChangeCharacter,
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
          src: props.characters[props.character],
          style: {
            width: '128px',
            height: 'auto',
          },
        }),
        `- ${props.character} -`,
      ]),

      h(
        'button',
        {
          type: 'button',
          onclick: [
            actions.ConnectionChangeCharacter,
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
        oninput: [actions.ConnectionReady, { id: props.id }],
      }),
      h('label', {
        for: `ready-${props.id}`,
      }, 'Ready?'),
    ]),
    h('div', { style: { flexGrow: 1 } }),
    h('button', {
      onclick: [
        actions.ConnectionRemove,
        { id : props.id },
      ],
    }, 'Remove'),
  ]);
};

const formElement = (props, children) => h('fieldset', {
  style: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: '100%',
    border: 'none',
  },
}, [
  h('label', {
    for: props.id,
    style: {
      marginBottom: '0.25rem',
    },
  }, props.label),
  children,
]);

export const characterSelect = ({ state, characters }) => {
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
    h(flexRow, {
      style: {
        backgroundColor: '#eee',
      },
    }, [
      h('h1', {}, 'JS Smash'),
      /*h('span', {}, [
        'Your host code is ',
        h('span', {
          style: {
            'font-family': 'monospace',
            'font-size': '1.5rem',
            'font-weight': 'bold',
            'text-decoration': 'underline',
          },
        }, 'ABC-123'),
      ]), */
      h('button', {
        onclick: actions.StartLocalGame,
        disabled: state.connections.length === 0 || state.connections.some(c => !c.ready),
      }, 'Start Game ->'),
    ]),
    h(playerGrid, {
      style: {
        justifyContent: 'flex-start',
        padding: '1rem',
        overflowY: 'auto',
      },
    }, [
      state.connections.length === 0
        &&h(placeholder, {}, 'Add your player below'),

      state.connections.map((connection) => h(
        player,
        {
          ...connection,
          characters,
        },
      )),
      
    ]),
    h(flexRow, {
      tag: 'form',
      style: {
        backgroundColor: '#eee',
        justifyContent: 'flex-start',
      },
      onsubmit: [
        actions.CharacterSelectionAddLocalConnection,
        (event) => {
          event.preventDefault();
        },
      ],
    }, [
      h(formElement, {
        id: 'new-player-color',
        label: 'Color',
      }, [
        h('input', {
          id: 'new-player-color',
          type: 'color',
          required: true,
          style: {
            width: '48px',
            height: '32px',
          },
          value: state.characterSelection.color,
          oninput: [
            actions.CharacterSelectionSetColor,
            e => ({ color: e.target.value }),
          ],
        }),
      ]),
      h(formElement, {
        id: 'new-player-name',
        label: 'Name',
      }, [
        h('input', {
          id: 'new-player-name',
          type: 'text',
          placeholder: 'Enter your name',
          minLength: 3,
          maxLength: 32,
          value: state.characterSelection.name,
          required: true,
          oninput: [
            actions.CharacterSelectionSetName,
            e => ({ name: e.target.value }),
          ],
        }),
      ]),
      h(formElement, {
        id: 'new-player-controls',
        label: 'Controls',
      }, [
        h('select', {
          id: 'new-player-controls',
          required: true,
        }, [
          h('option', { value: '' }, 'Select your controls'),
          Object.keys(state.keybinds).map((kb) => (
            h('option', {
              selected: state.characterSelection.keybind === kb,
              value: kb,
              onclick: [
                actions.CharacterSelectionSetKeybind,
                () => ({
                  keybind: kb,
                  gamepadIndex: null,
                }),
              ],
            }, kb)
          )),
          state.gamepads.filter(Boolean).map((gamepad) => (
            h('option', {
              selected: state.characterSelection.gamepadIndex === gamepad.index,
              value: gamepad.index,
              onclick: [
                actions.CharacterSelectionSetKeybind,
                () => ({
                  keybind: null,
                  gamepadIndex: gamepad.index,
                }),
              ],
            }, `Gamepad ${gamepad.index} (${gamepad.id})`)
          )),
        ]),
      ]),
      state.gamepads.filter(Boolean).length === 0 && (
        h('div', {}, 'If you have a gamepad, press any button to detect it')
      ),
      h('div', { style: { flexGrow: 1 } }),
      h('button', { type: 'submit' }, 'Add Player'),
    ]),
  ]);
};

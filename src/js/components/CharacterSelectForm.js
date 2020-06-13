import { h } from 'hyperapp';

import * as actions from '../actions';

import { FlexRow } from './FlexRow';

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

export const CharacterSelectForm = (props) => h(FlexRow, {
  tag: 'form',
  style: {
    backgroundColor: '#eee',
    justifyContent: 'flex-start',
  },
  onsubmit: [
    actions.CharacterSelectionAddPlayer,
    (event) => {
      event.preventDefault();
      return props;
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
      value: props.color,
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
      value: props.name,
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
      oninput: [
        actions.CharacterSelectionSetKeybind,
        (event) => ({ value: event.target.value }),
      ],
    }, [
      h('option', { value: '' }, 'Select your controls'),
      props.gamepads.filter(Boolean).map((gamepad) => (
        h('option', {
          selected: props.gamepadIndex === gamepad.index,
          value: gamepad.index,
        }, `Gamepad ${gamepad.index} (${gamepad.id})`)
      )),
      Object.keys(props.keybinds).map((kb) => (
        h('option', {
          selected: props.keybind === kb,
          value: kb,
        }, kb)
      )),
    ]),
  ]),
  props.gamepads.filter(Boolean).length === 0 && (
    h('div', {}, 'If you have a gamepad, press any button to detect it')
  ),
  h('div', { style: { flexGrow: 1 } }),
  h('button', { type: 'submit' }, 'Add Player'),
]);

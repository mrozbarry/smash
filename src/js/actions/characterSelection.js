import randomColor from 'randomcolor';

import * as effects from '../effects';

export const state = {
  gamepads: [null, null, null, null],
  characterSelection: {
    color: randomColor(),
    name: '',
    keybind: '',
    gamepadIndex: null,
  },
  keybinds: {
    Arrows: {
      'ArrowUp': 'jump',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Slash': 'punch',
      'ShiftRight': 'run',
    },
  },
};

export const GamepadsUpdate = (state, gamepads) => {
  const canUpdateKeybind = state.view == 'characterSelect'
    && !state.characterSelection.keybind
    && state.characterSelection.gamepadIndex === null;

  const newGamepad = state.gamepads.find((gamepad, index) => (
    (!gamepad || !gamepad.connected)
    && (gamepads[index] && gamepads[index].connected)
  ));

  const willChangeCharacterSelection = canUpdateKeybind && newGamepad;

  const characterSelection = willChangeCharacterSelection
    ? { ...state.characterSelection, keybind: '', gamepadIndex: newGamepad.index }
    : state.characterSelection;

  return [
    {
      ...state,
      gamepads,
      characterSelection,
    },
    willChangeCharacterSelection && effects.RumbleGamepad({
      gamepad: newGamepad,
    }),
  ];
};

export const CharacterSelectionStart = (state) => ({
  ...state,
  view: 'characterSelect',
});

export const CharacterSelectionSetColor = (state, { color }) => ({
  ...state,
  characterSelection: {
    ...state.characterSelection,
    color,
  },
});

export const CharacterSelectionSetName = (state, { name }) => ({
  ...state,
  characterSelection: {
    ...state.characterSelection,
    name,
  },
});

export const CharacterSelectionSetKeybind = (state, { value }) => {
  const keybind = state.keybinds[value] ? value : '';
  const gamepadIndex = state.gamepads.some(gp => gp && (gp.index == value)) ? value : null;
  return ({
    ...state,
    characterSelection: {
      ...state.characterSelection,
      keybind,
      gamepadIndex,
    },
  });
};

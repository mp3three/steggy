import { PersonDTO, PIN_TYPES } from '@steggy/controller-shared';
import React from 'react';

export const CurrentUserContext = React.createContext<{
  load: (person: string) => void;
  person: PersonDTO;
  togglePin: (type: PIN_TYPES, target: string, add: boolean) => void;
  update: (person: PersonDTO) => void;
}>({
  load: () => {
    return;
  },
  person: undefined,
  togglePin: () => {
    return;
  },
  update: () => {
    return;
  },
});

export const IsAuthContext = React.createContext<{
  base: string;
  key: string;
  updateBase: (key: string) => void;
  updateKey: (key: string) => void;
}>({
  base: undefined,
  key: undefined,
  updateBase: () => {
    return;
  },
  updateKey: () => {
    return;
  },
});

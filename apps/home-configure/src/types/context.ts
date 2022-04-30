import { PersonDTO } from '@steggy/controller-shared';
import React from 'react';

export const CurrentUserContext = React.createContext<{
  load: (person: string) => void;
  person: PersonDTO;
}>({
  load: () => {
    return;
  },
  person: undefined,
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

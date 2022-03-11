import { combineReducers, createStore } from 'redux';
export const CURRENT_COMPONENT = 'CURRENT_COMPONENT';

const initialState = {
  currentComponent: '',
  sideBarMenuItemKey: '',
};

function currentComponetReducer(
  state = initialState,
  action: {
    payload: { component: unknown; sideBarMenuKey: string };
    type: string;
  },
) {
  if (action.type === CURRENT_COMPONENT) {
    return {
      ...state,
      currentComponent: action.payload.component,
      sideBarMenuItemKey: action.payload.sideBarMenuKey,
    };
  }
  return state;
}

const rootReducer = combineReducers({ currentComponetReducer });
export const store = createStore(rootReducer);

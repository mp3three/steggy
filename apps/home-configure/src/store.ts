import { combineReducers, createStore } from 'redux';
export const CURRENT_COMPONENT = 'CURRENT_COMPONENT';

const initialState = {
  currentComponent: '',
  sideBarMenuItemKey: '',
};

function currentComponentReducer(
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

const rootReducer = combineReducers({
  currentComponentReducer: currentComponentReducer,
});
export const store = createStore(rootReducer);

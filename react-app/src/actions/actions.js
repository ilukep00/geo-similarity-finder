// To define the actions to execute
import { NEXT, BACK } from './actionTypes';

export const next = () => ({
  type: NEXT,

});

export const back = () => ({
  type: BACK,
});
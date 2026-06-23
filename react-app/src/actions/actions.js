// To define the actions to execute
import { NEXT, BACK } from './actionTypes';

export const next = (value) => ({
  type: NEXT,
  payload: value,
});

export const back = (value) => ({
  type: BACK,
  payload: value,
});
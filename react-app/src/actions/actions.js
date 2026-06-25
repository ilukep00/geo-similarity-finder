// To define the actions to execute
import { NEXT, BACK, AREATOPREDICTADDED } from './actionTypes';

export const next = () => ({
  type: NEXT,

});

export const back = () => ({
  type: BACK,
});

export const areaToPredictAdded = (value) => ({
  type: AREATOPREDICTADDED,
  payload: value
})
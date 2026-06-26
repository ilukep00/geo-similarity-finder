// To define the actions to execute
import { NEXT, BACK, AREATOPREDICTADDED, REGIONOFINTERESTADDED } from './actionTypes';

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

export const regionOfInterestAdded = (value) => ({
  type: REGIONOFINTERESTADDED,
  payload: value
})
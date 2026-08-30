// To define the actions to execute
import {
  NEXT,
  BACK,
  RESET,
  AREATOPREDICTADDED,
  REGIONOFINTERESTADDED,
  ISPROCESSING,
  STEPGEOMETRIESMANAGMENT,
} from "./actionTypes";

export const next = () => ({
  type: NEXT,
});

export const back = () => ({
  type: BACK,
});

export const reset = () => ({
  type: RESET
})

export const areaToPredictAdded = (value) => ({
  type: AREATOPREDICTADDED,
  payload: value,
});

export const regionOfInterestAdded = (value) => ({
  type: REGIONOFINTERESTADDED,
  payload: value,
});

export const isProcessing = (value) => ({
  type: ISPROCESSING,
  payload: value,
});

export const stepGeometriesManagment = (step, layerJSON) => ({
  type: STEPGEOMETRIESMANAGMENT,
  payload: { step, layerJSON },
});

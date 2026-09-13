import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import callToService from "../utils/utilityMethods.js";
import manageDrawControl from "../mapTools/draw-control.js";
import {
  areaToPredictAdded,
  stepGeometriesManagment,
  regionOfInterestAdded,
} from "../actions/actions.js";
import { isProcessing } from "../actions/actions.js";
import L from "leaflet";
import "../styles/WebMap.css";
import reprojectGeometry from "../mapTools/reproject-geometry.js";

const WebMap = () => {
  const FINAL_STEP = 4;
  const FIND_SIMILAR_REGIONS_URL = "http://127.0.0.1:8000/findSimilarRegions/";
  const DRAW_VECTORTYPES_SETTINGS = {
    polyline: false,
    polygon: {
      shapeOptions: {
        color: "#bada55",
      },
    },
    circle: false,
    rectangle: false,
    marker: false,
    circlemarker: false,
  };

  const dispacth = useDispatch();
  const drawControlRef = useRef(null);
  const featureGroupRef = useRef(null);
  const mapContainerRef = useRef(null);
  const webMapRef = useRef(null);
  const { step, stepGeometries } = useSelector((state) => state);

  const updateAreaToPredict = (value) => {
    dispacth(areaToPredictAdded(value));
  };

  const updateRegionOfInterest = (value) => {
    dispacth(regionOfInterestAdded(value));
  };

  const updateIsProcessing = (
    openDialog,
    messageDialog = "The Geometry is being processed",
  ) => {
    dispacth(isProcessing(openDialog, messageDialog));
  };

  const updateStepGeometries = (step, layerJSON) => {
    dispacth(stepGeometriesManagment(step, layerJSON));
  };

  const removeDrawControl = () => {
    if (webMapRef.current && drawControlRef.current) {
      webMapRef.current.removeControl(drawControlRef.current);
    }
  };

  const addDrawControl = () => {
    if (webMapRef.current && drawControlRef.current) {
      webMapRef.current.addControl(drawControlRef.current);
    }
  };

  // use effect for managing the first render of the map
  useEffect(() => {
    if (webMapRef.current) {
      return;
    }
    webMapRef.current = L.map(mapContainerRef.current).setView([40, 37], 3);
    L.tileLayer(
      "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x={x}&y={y}&z={z}",
    ).addTo(webMapRef.current);

    featureGroupRef.current = new L.FeatureGroup();
    webMapRef.current.addLayer(featureGroupRef.current);

    const drawControlOptions = {
      position: "topleft",
      draw: {
        ...DRAW_VECTORTYPES_SETTINGS,
      },
      edit: {
        featureGroup: featureGroupRef.current,
      },
    };
    drawControlRef.current = new L.Control.Draw(drawControlOptions);
    webMapRef.current.addControl(drawControlRef.current);

    manageDrawControl(
      webMapRef.current,
      featureGroupRef.current,
      updateAreaToPredict,
      updateRegionOfInterest,
      updateIsProcessing,
      updateStepGeometries,
    );

    return () => {
      if (webMapRef.current) {
        webMapRef.current.remove();
        webMapRef.current = null;
      }
    };
  }, []);

  // use effect for managing the geometry to show in each step
  useEffect(() => {
    if (featureGroupRef.current) {
      featureGroupRef.current.clearLayers();
      if (
        step - 1 < stepGeometries.length &&
        stepGeometries[step - 1] !== null
      ) {
        const featureJson = L.geoJSON(stepGeometries[step - 1]);
        featureJson.eachLayer((layer) => {
          featureGroupRef.current.addLayer(layer);
        });
      }
    }
  }, [step]);

  // use effect for managing the calling to the similarity service
  useEffect(() => {
    async function callToSimilarityService() {
      updateIsProcessing(true, "The similar regions are being predicted");
      const response = await callToService(FIND_SIMILAR_REGIONS_URL);
      updateIsProcessing(false);
      response.features?.forEach((feature) => {
        const reprojectedGeoJson = {
          type: feature.type,
          properties: feature.properties,
          geometry: reprojectGeometry(feature.geometry),
        };
        const featureJson = L.geoJSON(reprojectedGeoJson);
        featureGroupRef.current.addLayer(featureJson);
      });
    }
    if (step === FINAL_STEP) {
      callToSimilarityService();
    }
  }, [step]);

  // use effect for managing when the draw control should appear
  useEffect(() => {
    if (step === FINAL_STEP) {
      removeDrawControl();
    } else {
      addDrawControl();
    }
  }, [step]);

  return <div ref={mapContainerRef} className="mapContainer" />;
};

export default WebMap;

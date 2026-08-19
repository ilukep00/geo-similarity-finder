import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import callToService from "../utils/utilityMethods.js";
import manageDrawControl from "../mapTools/draw-control.js";
import { areaToPredictAdded } from "../actions/actions.js";
import { regionOfInterestAdded } from "../actions/actions.js";
import { isProcessing } from "../actions/actions.js";
import L from "leaflet";
import "../styles/WebMap.css";
import reprojectGeometry from "../mapTools/reproject-geometry.js";

const WebMap = () => {
  const FIND_SIMILAR_REGIONS_URL = "http://127.0.0.1:8000/findSimilarRegions/";

  const dispacth = useDispatch();
  const mapContainerRef = useRef(null);
  const webMapRef = useRef(null);
  const { step } = useSelector((state) => state);

  const updateAreaToPredict = (value) => {
    dispacth(areaToPredictAdded(value));
  };

  const updateRegionOfInterest = (value) => {
    dispacth(regionOfInterestAdded(value));
  };

  const updateIsProcessing = (value) => {
    dispacth(isProcessing(value));
  };

  useEffect(() => {
    if (webMapRef.current) {
      return;
    }
    webMapRef.current = L.map(mapContainerRef.current).setView([40, 37], 3);
    L.tileLayer(
      "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x={x}&y={y}&z={z}",
    ).addTo(webMapRef.current);

    manageDrawControl(
      webMapRef.current,
      updateAreaToPredict,
      updateRegionOfInterest,
      updateIsProcessing,
    );

    return () => {
      if (webMapRef.current) {
        webMapRef.current.remove();
        webMapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    async function callToSimilarityService() {
      updateIsProcessing(true);
      const response = await callToService(FIND_SIMILAR_REGIONS_URL);
      updateIsProcessing(false);
      const drawnItems = new L.FeatureGroup();
      response.features?.forEach((feature) => {
        const reprojectedGeoJson = {
          type: feature.type,
          properties: feature.properties,
          geometry: reprojectGeometry(feature.geometry),
        };
        const featureJson = L.geoJSON(reprojectedGeoJson);
        drawnItems.addLayer(featureJson);
      });
      webMapRef.current.addLayer(drawnItems);
    }
    if (step === 4) {
      callToSimilarityService();
    }
  }, [step]);

  return <div ref={mapContainerRef} className="mapContainer" />;
};

export default WebMap;

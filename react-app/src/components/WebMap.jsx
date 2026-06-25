import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import manageDrawControl from "../mapTools/draw-control.js";
import { areaToPredictAdded } from "../actions/actions.js";
import L from "leaflet";
import "../styles/WebMap.css";

const WebMap = () => {
  const dispacth = useDispatch();
  const mapContainerRef = useRef(null);
  const webMapRef = useRef(null);
  const { step } = useSelector((state) => state);

  const updateAreaToPredict = (value) => {
    dispacth(areaToPredictAdded(value));
  };

  useEffect(() => {
    if (webMapRef.current) {
      return;
    }
    webMapRef.current = L.map(mapContainerRef.current).setView([40, 37], 3);
    L.tileLayer(
      "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x={x}&y={y}&z={z}",
    ).addTo(webMapRef.current);

    manageDrawControl(webMapRef.current, step, updateAreaToPredict);

    return () => {
      if (webMapRef.current) {
        webMapRef.current.remove();
        webMapRef.current = null;
      }
    };
  }, [step]);

  return <div ref={mapContainerRef} className="mapContainer" />;
};

export default WebMap;

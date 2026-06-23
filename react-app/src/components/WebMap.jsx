import React, { useEffect, useRef } from "react";
import { useSelector } from 'react-redux';
import manageDrawControl from "../mapTools/draw-control.js"
import L from "leaflet";
import "../styles/WebMap.css";


const WebMap = () => {
  const mapContainerRef = useRef(null);
  const webMapRef = useRef(null);
  const {step} = useSelector(state => state);

  useEffect(() => {
    if (webMapRef.current) {
      return;
    }
    webMapRef.current = L.map(mapContainerRef.current).setView([40, 37], 3);
    L.tileLayer(
      "https://www.google.cn/maps/vt?lyrs=s@189&gl=cr&x={x}&y={y}&z={z}",
    ).addTo(webMapRef.current);

    manageDrawControl(webMapRef.current, step);

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

"use client";
import React, { useEffect, useRef } from "react";
import Highcharts from "highcharts";
const GeographicMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      const locations = [
        { name: "Vilnius", lat: 54.6872, lon: 25.2797, value: 86011 },
        { name: "Kaunas", lat: 54.8985, lon: 23.9036, value: 25108 },
        { name: "Riga", lat: 56.9496, lon: 24.1052, value: 22337 },
        { name: "Chisinau", lat: 47.0105, lon: 28.8638, value: 16008 },
      ];

      Highcharts.chart(mapRef.current, {
        chart: {
          height: 400,
        },
        title: {
          text: "Geographic Distribution",
        },
        xAxis: {
          min: 20,
          max: 30,
        },
        yAxis: {
          min: 45,
          max: 58,
        },
        series: [
          {
            type: "scatter",
            name: "Impressions",
            data: locations.map((loc) => ({
              x: loc.lon,
              y: loc.lat,
              z: loc.value,
              name: loc.name,
            })),
            marker: {
              radius: 8,
              fillColor: "rgba(59, 130, 246, 0.7)",
            },
            tooltip: {
              pointFormat:
                "<b>{point.name}</b><br/>Impressions: {point.z:,.0f}",
            },
          },
        ],
      });
    }
  }, []);

  return (
    <>
      <div ref={mapRef}></div>
      <div className="row g-3 mt-3">
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <small className="text-muted">Vilnius</small>
              <h4 className="mb-0 text-primary fw-bold">43.15%</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <small className="text-muted">Kaunas</small>
              <h4 className="mb-0 text-primary fw-bold">12.60%</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <small className="text-muted">Riga</small>
              <h4 className="mb-0 text-primary fw-bold">11.21%</h4>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-primary bg-opacity-10">
            <div className="card-body text-center">
              <small className="text-muted">Chisinau</small>
              <h4 className="mb-0 text-primary fw-bold">8.00%</h4>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
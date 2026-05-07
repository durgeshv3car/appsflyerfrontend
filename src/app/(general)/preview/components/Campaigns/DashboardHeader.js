"use client";
import React, { useEffect, useRef } from "react";

const DashboardHeader = () => (
  <header className="bg-white border-bottom shadow-sm">
    <div className="container-fluid py-3 px-3 px-md-4">
      <div className="d-flex flex-column gap-3">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="h4 fw-bold text-dark mb-0" style={{ letterSpacing: '-0.02em' }}>Campaign Performance Report</h1>
        </div>
        <div className="text-muted border-top pt-2">
          <div className="row g-2 align-items-center">
            <div className="col-12 col-md-auto me-md-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-building text-primary opacity-75"></i>
                <div>
                  <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '8px', letterSpacing: '0.05em' }}>Client</small>
                  <span className="text-dark fw-bold" style={{ fontSize: '12px' }}>Intellectads - Fly Dubai (USD)</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-auto me-md-4">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-calendar-event text-primary opacity-75"></i>
                <div>
                  <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '8px', letterSpacing: '0.05em' }}>Period</small>
                  <span className="text-dark fw-bold" style={{ fontSize: '12px' }}>2025-09-23 - 2025-09-29</span>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-auto">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-bullseye text-primary opacity-75"></i>
                <div>
                  <small className="d-block text-muted text-uppercase fw-bold" style={{ fontSize: '8px', letterSpacing: '0.05em' }}>Campaigns</small>
                  <span className="text-dark fw-bold" style={{ fontSize: '12px' }}>Fly Dubai Moldova2, Latvia2, Lithuania2</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
);

export default DashboardHeader;
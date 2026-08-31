"use client";
import React, { useState, useEffect } from "react";
import TopStepperNav from "./components/TopStepperNav";
import Step1CreateAudience from "./components/Step1CreateAudience";
import Step2CreateCreative from "./components/Step2CreateCreative";
import Step3CampaignSetup from "./components/Step3CampaignSetup";
import Step4ReviewLaunch from "./components/Step4ReviewLaunch";
import { FiPlusCircle, FiRotateCcw } from "react-icons/fi";
import topTost from "@/utils/topTost";

export default function AdCreationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Shared Ad Creation context across the 4 steps
  const [selectedAudience, setSelectedAudience] = useState(null);
  const [selectedCreative, setSelectedCreative] = useState(null);
  const [campaignData, setCampaignData] = useState({
    campaignName: "DV360 Summer 2026 Campaign",
    objective: "CONVERSIONS",
    bidStrategy: "CPM",
    bidAmount: "2.50",
    dailyBudget: "500",
    totalBudget: "10000",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    devices: ["DESKTOP", "MOBILE", "TABLET", "CTV"],
  });

  // Load persisted audience and creative on mount
  useEffect(() => {
    try {
      const savedAud = localStorage.getItem("selectedAudience");
      if (savedAud) {
        setSelectedAudience(JSON.parse(savedAud));
      }
      const savedCr = localStorage.getItem("selectedCreative");
      if (savedCr) {
        setSelectedCreative(JSON.parse(savedCr));
      }
    } catch (e) {}
  }, []);

  // Update audience handler
  const handleAudienceSelected = (aud) => {
    setSelectedAudience(aud);
    try {
      if (aud) {
        localStorage.setItem("selectedAudience", JSON.stringify(aud));
      } else {
        localStorage.removeItem("selectedAudience");
      }
    } catch (e) {}
  };

  // Update creative handler
  const handleCreativeSelected = (cr) => {
    setSelectedCreative(cr);
    try {
      if (cr) {
        localStorage.setItem("selectedCreative", JSON.stringify(cr));
      } else {
        localStorage.removeItem("selectedCreative");
      }
    } catch (e) {}
  };

  // Mark step as completed and advance
  const handleStepComplete = (stepId, nextStep) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps((prev) => [...prev, stepId]);
    }
    setCurrentStep(nextStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Direct step navigation
  const handleStepChange = (stepId) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset wizard
  const handleReset = () => {
    setCurrentStep(1);
    setCompletedSteps([]);
    setSelectedAudience(null);
    setSelectedCreative(null);
    try {
      localStorage.removeItem("selectedAudience");
      localStorage.removeItem("selectedCreative");
    } catch (e) {}
    topTost("Ad creation wizard reset", "info");
  };

  return (
    <div className="container-fluid py-4 px-3 px-md-4">
      {/* Top Page Header */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h3 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <FiPlusCircle className="text-primary" /> Ad Creation Studio
            </h3>
            <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-1 fs-12 fw-semibold">
              DV360 Workflow
            </span>
          </div>
          <p className="text-muted mb-0 fs-13">
            Build and publish ads across 4 connected steps: DV360 Customer Match Audience, Creative Media, Campaign Setup, and Launch.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5"
        >
          <FiRotateCcw size={14} /> Start Over
        </button>
      </div>

      {/* 4-Step Top Stepper Navigation */}
      <TopStepperNav
        currentStep={currentStep}
        onStepChange={handleStepChange}
        completedSteps={completedSteps}
      />

      {/* Dynamic Step Content Rendering */}
      <div className="step-content-area">
        {currentStep === 1 && (
          <Step1CreateAudience
            initialAudience={selectedAudience}
            onAudienceSelected={handleAudienceSelected}
            onNext={() => handleStepComplete(1, 2)}
          />
        )}

        {currentStep === 2 && (
          <Step2CreateCreative
            initialCreative={selectedCreative}
            selectedAudience={selectedAudience}
            onCreativeSelected={handleCreativeSelected}
            onNext={() => handleStepComplete(2, 3)}
            onPrev={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <Step3CampaignSetup
            campaignData={campaignData}
            selectedAudience={selectedAudience}
            selectedCreative={selectedCreative}
            onCampaignDataChange={(data) => setCampaignData(data)}
            onNext={() => handleStepComplete(3, 4)}
            onPrev={() => setCurrentStep(2)}
          />
        )}

        {currentStep === 4 && (
          <Step4ReviewLaunch
            selectedAudience={selectedAudience}
            selectedCreative={selectedCreative}
            campaignData={campaignData}
            onPrev={() => setCurrentStep(3)}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

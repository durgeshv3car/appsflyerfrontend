"use client";
import React from "react";
import { FiUsers, FiImage, FiSliders, FiCheckCircle, FiCheck, FiArrowRight } from "react-icons/fi";

const steps = [
  {
    id: 1,
    title: "Create Audience",
    subtitle: "DV360 Customer Match",
    icon: FiUsers,
  },
  {
    id: 2,
    title: "Create Creative",
    subtitle: "Assets & Media Studio",
    icon: FiImage,
  },
  {
    id: 3,
    title: "Campaign Setup",
    subtitle: "Targeting & Bidding",
    icon: FiSliders,
  },
  {
    id: 4,
    title: "Review & Launch",
    subtitle: "Summary & Publishing",
    icon: FiCheckCircle,
  },
];

const TopStepperNav = ({ currentStep, onStepChange, completedSteps = [] }) => {
  const progressPercent = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden" style={{ background: "#ffffff" }}>
      {/* Header bar with title and progress */}
      <div className="px-4 py-3 border-bottom d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ background: "linear-gradient(90deg, #f8faff 0%, #f4f6fb 100%)" }}>
        <div>
          <span className="badge bg-primary-subtle text-primary fw-semibold px-2.5 py-1 rounded-pill mb-1">
            Step {currentStep} of {steps.length}
          </span>
          <h5 className="fw-bold mb-0 text-dark">
            {steps[currentStep - 1]?.title}
          </h5>
        </div>
        <div className="d-flex align-items-center gap-3">
          <div className="d-none d-md-block text-end">
            <span className="text-muted small fw-medium">Ad Creation Flow</span>
            <div className="fw-bold text-dark fs-13">{Math.round(progressPercent)}% Completed</div>
          </div>
          <div className="progress rounded-pill shadow-xs" style={{ width: "120px", height: "8px", background: "#e2e8f0" }}>
            <div
              className="progress-bar progress-bar-striped progress-bar-animated bg-primary rounded-pill"
              role="progressbar"
              style={{ width: `${progressPercent}%`, transition: "width 0.4s ease" }}
              aria-valuenow={progressPercent}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
        </div>
      </div>

      {/* Stepper Buttons Row */}
      <div className="p-3 p-lg-4">
        <div className="row g-2 g-lg-3 align-items-center">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCurrent = currentStep === step.id;
            const isCompleted = completedSteps.includes(step.id) || currentStep > step.id;
            const isAccessible = isCompleted || step.id <= currentStep + 1;

            return (
              <React.Fragment key={step.id}>
                <div className="col-12 col-sm-6 col-lg-3">
                  <button
                    type="button"
                    onClick={() => isAccessible && onStepChange(step.id)}
                    disabled={!isAccessible}
                    className={`btn w-100 p-3 text-start rounded-3 border transition-all position-relative ${
                      isCurrent
                        ? "border-primary shadow-sm"
                        : isCompleted
                        ? "border-success-subtle bg-success-subtle/10"
                        : "border-light-subtle bg-light text-muted"
                    }`}
                    style={{
                      background: isCurrent
                        ? "linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%)"
                        : isCompleted
                        ? "#f0fdf4"
                        : "#fafbfc",
                      borderColor: isCurrent ? "#3b82f6" : isCompleted ? "#86efac" : "#e5e7eb",
                      cursor: isAccessible ? "pointer" : "not-allowed",
                      transform: isCurrent ? "translateY(-1px)" : "none",
                      transition: "all 0.25s ease",
                    }}
                  >
                    {/* Step indicator tag */}
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                        style={{
                          width: "42px",
                          height: "42px",
                          background: isCurrent
                            ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                            : isCompleted
                            ? "linear-gradient(135deg, #16a34a, #22c55e)"
                            : "#e2e8f0",
                          color: isCurrent || isCompleted ? "#ffffff" : "#64748b",
                          boxShadow: isCurrent
                            ? "0 4px 12px rgba(37,99,235,0.25)"
                            : isCompleted
                            ? "0 4px 12px rgba(22,163,74,0.2)"
                            : "none",
                        }}
                      >
                        {isCompleted ? <FiCheck size={20} strokeWidth={3} /> : <Icon size={20} />}
                      </div>

                      <div className="overflow-hidden flex-grow-1">
                        <div className="d-flex align-items-center justify-content-between">
                          <span
                            className="text-uppercase fw-bold"
                            style={{
                              fontSize: "11px",
                              letterSpacing: "0.5px",
                              color: isCurrent ? "#2563eb" : isCompleted ? "#16a34a" : "#94a3b8",
                            }}
                          >
                            Step {step.id}
                          </span>
                          {isCurrent && (
                            <span className="badge bg-primary text-white rounded-pill px-2 py-0.5" style={{ fontSize: "10px" }}>
                              Active
                            </span>
                          )}
                          {isCompleted && !isCurrent && (
                            <span className="badge bg-success text-white rounded-pill px-2 py-0.5" style={{ fontSize: "10px" }}>
                              Done
                            </span>
                          )}
                        </div>
                        <div
                          className="fw-bold text-truncate"
                          style={{
                            fontSize: "14px",
                            color: isCurrent ? "#1e293b" : isCompleted ? "#14532d" : "#64748b",
                          }}
                        >
                          {step.title}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: "11px" }}>
                          {step.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Active accent bar */}
                    {isCurrent && (
                      <div
                        className="position-absolute start-0 bottom-0 end-0 rounded-bottom"
                        style={{ height: "3px", background: "linear-gradient(90deg, #2563eb, #60a5fa)" }}
                      />
                    )}
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopStepperNav;

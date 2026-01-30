"use client";
import React, { useState, useEffect } from "react";
import { Target, Mail, Type, X, Check } from "lucide-react";
import { createAdvertiser } from "@/services/advertiser";


const validateAdvertiseName = (value) => {
  if (!value) return "Advertise name is required";
  if (value.length < 3) return "Too short! Minimum 3 characters";
  if (value.length > 50) return "Too long! Maximum 50 characters";
  return "";
};

const validateRequired = (value, fieldName) => {
  if (!value) return `${fieldName} is required`;
  return "";
};

const CreateAdvertiseModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    advertise_name: "",
    advertise_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setFormData({
      advertise_name: "",
      advertise_id: "",
    });
    setErrors({});
    setIsSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {
      advertise_name: validateAdvertiseName(formData.advertise_name),
      advertise_id: validateRequired(formData.advertise_id, "Advertise ID"),

    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await createAdvertiser(formData);
      setIsSuccess(true);
      onSuccess();
      setTimeout(() => {
        onClose();
        resetForm();
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-start justify-content-end"
      style={{ zIndex: 1050, backgroundColor: "rgba(0,0,0,0.5)", paddingTop: "20px", paddingRight: "20px" }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg p-4 position-relative"
        style={{ maxWidth: "450px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          className="btn-close position-absolute top-0 end-0 m-3"
          onClick={onClose}
          aria-label="Close"
        ></button>

        {/* Success Overlay */}
        {isSuccess && (
          <div
            className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-success bg-opacity-75 top-0 start-0 rounded"
            style={{ zIndex: 10 }}
          >
            <div className="mb-3">
              <Check className="text-white" size={40} />
            </div>
            <h4 className="text-white">Campaign Created!</h4>
          </div>
        )}

        {/* Header */}
        <div className="text-start mb-4 mt-3">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "45px", height: "45px" }}>
            <Target size={20} />
          </div>
          <h5>Create Advertise ID</h5>
          <p className="text-muted small mb-0">Launch your next marketing campaign</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Advertise Name */}
          <div className="mb-3">
            <label htmlFor="advertise_name" className="form-label small">
              <Type className="me-2" size={14} style={{ display: "inline" }} /> Advertise Name
            </label>
            <input
              type="text"
              id="advertise_name"
              className={`form-control form-control-sm ${
                errors.advertise_name ? "is-invalid" : formData.advertise_name && "is-valid"
              }`}
              placeholder="Enter advertise name"
              value={formData.advertise_name}
              onChange={(e) => handleChange("advertise_name", e.target.value)}
            />
            {errors.advertise_name && (
              <div className="invalid-feedback small">{errors.advertise_name}</div>
            )}
          </div>

          {/* Advertise ID */}
          <div className="mb-3">
            <label htmlFor="advertise_id" className="form-label small">
              <Target className="me-2" size={14} style={{ display: "inline" }} /> Advertise ID
            </label>
            <input
              type="text"
              id="advertise_id"
              className={`form-control form-control-sm ${
                errors.advertise_id ? "is-invalid" : formData.advertise_id && "is-valid"
              }`}
              placeholder="Enter advertise ID"
              value={formData.advertise_id}
              onChange={(e) => handleChange("advertise_id", e.target.value)}
            />
            {errors.advertise_id && (
              <div className="invalid-feedback small">{errors.advertise_id}</div>
            )}
          </div>

         

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="spinner-border spinner-border-sm me-2"></span>}
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAdvertiseModal;

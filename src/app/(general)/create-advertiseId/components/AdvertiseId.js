"use client";
import React, { useState } from "react";
import { Target, Mail, Type, Check } from "lucide-react";
import { createAdvertiser } from "@/services/advertiser";

const validateCampaignName = (value) => {
  if (!value) return "Campaign name is required";
  if (value.length < 3) return "Too short! Minimum 3 characters";
  if (value.length > 50) return "Too long! Maximum 50 characters";
  return "";
};

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

const AdvertiseId = () => {
  const [formData, setFormData] = useState({ advertise_name: "", advertise_id: "" ,campaign_name: "", campaign_id: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {
      advertise_name: validateAdvertiseName(formData.advertise_name),
      advertise_id: validateRequired(formData.advertise_id, "Advertise ID"),
      campaign_name: validateCampaignName(formData.campaign_name),
      campaign_id: validateRequired(formData.campaign_id, "Campaign ID"),
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
      console.log(res, "token data");
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => {
      setFormData({ advertise_name: "", advertise_id: "", campaign_name: "", campaign_id: "" });
      setIsSuccess(false);
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <div className="container  d-flex align-items-center justify-content-center">
      <div className="card shadow-lg p-4 p-lg-5 position-relative" style={{ maxWidth: "500px", width: "100%" }}>
        
        {/* Success Overlay */}
        {isSuccess && (
          <div className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-success bg-opacity-75 top-0 start-0 rounded" style={{ zIndex: 10 }}>
            <div className="mb-3">
              <Check className="text-white" size={40} />
            </div>
            <h4 className="text-white">Campaign Created!</h4>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-4">
          <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
            <Target size={24} />
          </div>
          <h2>Create Advertise ID</h2>
          <p className="text-muted">Launch your next marketing campaign with style and precision</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Advertise Name */}
          <div className="mb-3">
            <label htmlFor="advertise_name" className="form-label">
              <Type className="me-2" size={16} /> Advertise Name
            </label>
            <input
              type="text"
              id="advertise_name"
              className={`form-control ${errors.advertise_name ? "is-invalid" : formData.advertise_name && "is-valid"}`}
              placeholder="Enter advertise name"
              value={formData.advertise_name}
              onChange={(e) => handleChange("advertise_name", e.target.value)}
            />
            {errors.advertise_name && <div className="invalid-feedback">{errors.advertise_name}</div>}
          </div>

          {/* Advertise ID */}
          <div className="mb-3">
            <label htmlFor="advertise_id" className="form-label">
              <Target className="me-2" size={16} /> Advertise ID
            </label>
            <input
              type="text"
              id="advertise_id"
              className={`form-control ${errors.advertise_id ? "is-invalid" : formData.advertise_id && "is-valid"}`}
              placeholder="Enter advertise ID"
              value={formData.advertise_id}
              onChange={(e) => handleChange("advertise_id", e.target.value)}
            />
            {errors.advertise_id && <div className="invalid-feedback">{errors.advertise_id}</div>}
          </div>

          {/* Campaign Name */}
          <div className="mb-3">
            <label htmlFor="campaign_name" className="form-label">
              <Type className="me-2" size={16} /> Campaign Name
            </label>
            <input
              type="text"
              id="campaign_name"
              className={`form-control ${errors.campaign_name ? "is-invalid" : formData.campaign_name && "is-valid"}`}
              placeholder="Enter campaign name"
              value={formData.campaign_name}
              onChange={(e) => handleChange("campaign_name", e.target.value)}
            />
            {errors.campaign_name && <div className="invalid-feedback">{errors.campaign_name}</div>}
          </div>

          {/* Campaign ID */}
          <div className="mb-3">
            <label htmlFor="campaign_id" className="form-label">
              <Mail className="me-2" size={16} /> Campaign ID
            </label>
            <input
              type="text"
              id="campaign_id"
              className={`form-control ${errors.campaign_id ? "is-invalid" : formData.campaign_id && "is-valid"}`}
              placeholder="Enter campaign ID"
              value={formData.campaign_id}
              onChange={(e) => handleChange("campaign_id", e.target.value)}
            />
            {errors.campaign_id && <div className="invalid-feedback">{errors.campaign_id}</div>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn btn-primary w-100 d-flex align-items-center justify-content-center" disabled={isSubmitting}>
            {isSubmitting && <span className="spinner-border spinner-border-sm me-2"></span>}
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-muted mt-3 mb-0 small">
          Ready to launch? Your campaign will be live in minutes! 🚀
        </p>
      </div>
    </div>
  );
};

export default AdvertiseId;

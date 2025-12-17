"use client";
import React, { useState } from "react";
import { Target, Mail, Type, Check } from "lucide-react";
import { createToken } from "@/services/token";

const validateCampaignName = (value) => {
  if (!value) return "Campaign name is required";
  if (value.length < 3) return "Too short! Minimum 3 characters";
  if (value.length > 50) return "Too long! Maximum 50 characters";
  return "";
};

const validateEmail = (value) => {
  if (!value) return "Email is required";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) return "Invalid email address";
  return "";
};

const Token = () => {
  const [formData, setFormData] = useState({ campaign_name: "", email: "" });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {
      campaign_name: validateCampaignName(formData.campaign_name),
      email: validateEmail(formData.email),
    };
    setErrors(newErrors);
    return !newErrors.campaign_name && !newErrors.email;
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
      const res = await createToken(formData.campaign_name, formData.email);
      console.log(res, "token data");
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
    }
    setTimeout(() => {
      setFormData({ campaign_name: "", email: "" });
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
          <h2>Create Campaign</h2>
          <p className="text-muted">Launch your next marketing campaign with style and precision</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Campaign Name */}
          <div className="mb-3">
            <label htmlFor="campaign_name" className="form-label">
              <Type className="me-2" size={16} /> Campaign Name
            </label>
            <input
              type="text"
              id="campaign_name"
              className={`form-control ${errors.campaign_name ? "is-invalid" : formData.campaign_name && "is-valid"}`}
              placeholder="Enter your campaign name"
              value={formData.campaign_name}
              onChange={(e) => handleChange("campaign_name", e.target.value)}
            />
            {errors.campaign_name && <div className="invalid-feedback">{errors.campaign_name}</div>}
          </div>

          {/* Email */}
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              <Mail className="me-2" size={16} /> Email Address
            </label>
            <input
              type="email"
              id="email"
              className={`form-control ${errors.email ? "is-invalid" : formData.email && "is-valid"}`}
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
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

export default Token;

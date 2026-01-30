"use client";
import React, { useState, useEffect } from "react";
import { Target, Mail, Type, Check } from "lucide-react";
import {
  createAdvertiser,
  createAdvertiserCampaign,
  getAdvertisers,
} from "@/services/advertiser";

const validateCampaignName = (value) => {
  if (!value) return "Campaign name is required";
  if (value.length < 3) return "Too short! Minimum 3 characters";
  if (value.length > 50) return "Too long! Maximum 50 characters";
  return "";
};

const validateRequired = (value, fieldName) => {
  if (!value) return `${fieldName} is required`;
  return "";
};

const CreateCampaignModal = ({ show, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    advertiser_id: "",
    campaign_name: "",
    campaign_id: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [advertisers, setAdvertisers] = useState([]);
  const [loadingAdvertisers, setLoadingAdvertisers] = useState(false);

  useEffect(() => {
    if (show) {
      fetchAdvertisers();
    } else {
      resetForm();
    }
  }, [show]);

  const fetchAdvertisers = async () => {
    setLoadingAdvertisers(true);
    try {
      const res = await getAdvertisers();

      if (res.results) {
        setAdvertisers(res.data.advertises);
      }
    } catch (error) {
      console.error("Error fetching advertisers:", error);
    } finally {
      setLoadingAdvertisers(false);
    }
  };

  const resetForm = () => {
    setFormData({
      advertiser_id: "",
      campaign_name: "",
      campaign_id: "",
    });
    setErrors({});
    setIsSuccess(false);
  };

  const validateForm = () => {
    const newErrors = {
      advertiser_id: validateRequired(formData.advertiser_id, "Advertiser"),
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
      const res = await createAdvertiserCampaign(formData);
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
      style={{
        zIndex: 1050,
        backgroundColor: "rgba(0,0,0,0.5)",
        paddingTop: "20px",
        paddingRight: "20px",
      }}
      onClick={onClose}
    >
      <div
        className="card shadow-lg p-4 position-relative"
        style={{
          maxWidth: "450px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
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
          <div
            className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
            style={{ width: "45px", height: "45px" }}
          >
            <Target size={20} />
          </div>
          <h5>Create Campaign</h5>
          <p className="text-muted small mb-0">
            Create a new campaign for your advertiser
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Advertiser Dropdown */}
          <div className="mb-3">
            <label htmlFor="advertiser_id" className="form-label small">
              <Target
                className="me-2"
                size={14}
                style={{ display: "inline" }}
              />{" "}
              Select Advertiser
            </label>
            <select
              id="advertiser_id"
              className={`form-select form-select-sm ${
                errors.advertiser_id
                  ? "is-invalid"
                  : formData.advertiser_id && "is-valid"
              }`}
              value={formData.advertiser_id}
              onChange={(e) => handleChange("advertiser_id", e.target.value)}
              disabled={loadingAdvertisers}
            >
              <option value="">
                {loadingAdvertisers
                  ? "Loading advertisers..."
                  : "Choose an advertiser"}
              </option>
              {advertisers.map((advertiser) => (
                <option key={advertiser._id} value={advertiser._id}>
                  {advertiser.advertiser_name} ({advertiser.advertise_id})
                </option>
              ))}
            </select>
            {errors.advertiser_id && (
              <div className="invalid-feedback small">
                {errors.advertiser_id}
              </div>
            )}
          </div>

          {/* Campaign Name */}
          <div className="mb-3">
            <label htmlFor="campaign_name" className="form-label small">
              <Type className="me-2" size={14} style={{ display: "inline" }} />{" "}
              Campaign Name
            </label>
            <input
              type="text"
              id="campaign_name"
              className={`form-control form-control-sm ${
                errors.campaign_name
                  ? "is-invalid"
                  : formData.campaign_name && "is-valid"
              }`}
              placeholder="Enter campaign name"
              value={formData.campaign_name}
              onChange={(e) => handleChange("campaign_name", e.target.value)}
            />
            {errors.campaign_name && (
              <div className="invalid-feedback small">
                {errors.campaign_name}
              </div>
            )}
          </div>

          {/* Campaign ID */}
          <div className="mb-3">
            <label htmlFor="campaign_id" className="form-label small">
              <Mail className="me-2" size={14} style={{ display: "inline" }} />{" "}
              Campaign ID
            </label>
            <input
              type="text"
              id="campaign_id"
              className={`form-control form-control-sm ${
                errors.campaign_id
                  ? "is-invalid"
                  : formData.campaign_id && "is-valid"
              }`}
              placeholder="Enter campaign ID"
              value={formData.campaign_id}
              onChange={(e) => handleChange("campaign_id", e.target.value)}
            />
            {errors.campaign_id && (
              <div className="invalid-feedback small">{errors.campaign_id}</div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="spinner-border spinner-border-sm me-2"></span>
            )}
            {isSubmitting ? "Creating..." : "Create Campaign"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCampaignModal;

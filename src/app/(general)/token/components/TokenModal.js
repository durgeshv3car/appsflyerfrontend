"use client";
import React, { useState, useEffect } from "react";
import { X, Key, Mail, CheckCircle, Loader2 } from "lucide-react";
import { createToken, updateToken } from "@/services/token";
import { toast } from "react-toastify";

export default function TokenModal({ show, onClose, onSuccess, initialData }) {
  const [email, setEmail] = useState("");
  const [tokenVal, setTokenVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const isEdit = Boolean(initialData && (initialData._id || initialData.id));

  useEffect(() => {
    if (show) {
      if (initialData) {
        setEmail(initialData.email || initialData.gmail || "");
        setTokenVal(initialData.token || initialData.campaign_name || "");
      } else {
        setEmail("");
        setTokenVal("");
      }
      setErrorMsg("");
    }
  }, [show, initialData]);

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email.trim()) {
      setErrorMsg("Please enter a valid Email address.");
      return;
    }
    if (!tokenVal.trim()) {
      setErrorMsg("Please enter a Token.");
      return;
    }

    try {
      setLoading(true);
      const targetEmail = email.trim();
      const targetToken = tokenVal.trim();

      if (isEdit) {
        const tokenId = initialData._id || initialData.id;
        await updateToken(tokenId, targetEmail, targetToken);
        toast.success("Token updated successfully!");
      } else {
        await createToken(targetEmail, targetToken);
        toast.success("Token created successfully!");
      }

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err) {
      console.error("Token save error:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to save token. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Modal Header */}
          <div
            className="modal-header border-0 text-white px-4 py-3"
            style={{
              background: "linear-gradient(135deg, #031035 0%, #1a2b5a 100%)",
            }}
          >
            <div className="d-flex align-items-center gap-2">
              <div
                className="d-flex align-items-center justify-content-center rounded-3 p-2"
                style={{ background: "rgba(255, 255, 255, 0.15)" }}
              >
                <Key className="text-white" size={20} />
              </div>
              <h5 className="modal-title fw-bold text-white mb-0">
                {isEdit ? "Edit Token & Email" : "Add New Token & Email"}
              </h5>
            </div>
            <button
              type="button"
              className="btn-close btn-close-white opacity-100"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {errorMsg && (
                <div className="alert alert-danger rounded-3 py-2 px-3 mb-3 small d-flex align-items-center gap-2">
                  <X size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Email Field */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark mb-1">
                  Email <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Mail size={18} className="text-muted" />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light border-start-0"
                    placeholder="user@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <small className="text-muted mt-1 d-block" style={{ fontSize: "12px" }}>
                  Enter the Email address for this token.
                </small>
              </div>

              {/* Token Field */}
              <div className="mb-3">
                <label className="form-label fw-bold text-dark mb-1">
                  Token <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Key size={18} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0 font-monospace"
                    placeholder="Enter Token key..."
                    value={tokenVal}
                    onChange={(e) => setTokenVal(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <small className="text-muted mt-1 d-block" style={{ fontSize: "12px" }}>
                  Enter the API token code to store in the database.
                </small>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer border-top-0 px-4 pb-4 pt-0 bg-light">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 rounded-3"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn text-white px-4 rounded-3 d-flex align-items-center gap-2"
                style={{ background: "#031035" }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="spinner-border spinner-border-sm" size={16} />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    <span>{isEdit ? "Update Token" : "Save Token"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

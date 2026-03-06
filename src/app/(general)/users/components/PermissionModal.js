"use client";
import React, { useState, useEffect } from "react";
import { X, Layers, Shield } from "lucide-react";

const PermissionModal = ({ show, onClose, user, onSave }) => {
  const [permissions, setPermissions] = useState([]);

  // Sync when user changes
  useEffect(() => {
    if (user) {
      setPermissions(user.permissions || []);
    }
  }, [user]);

  if (!show) return null;

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setPermissions((prev) => [...prev, value]);
    } else {
      setPermissions((prev) => prev.filter((p) => p !== value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user._id, { permissions });
  };

  return (
    <>
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, padding: '20px' }}>
        <div className="bg-white rounded-3 shadow-lg p-0 d-flex flex-column" style={{ width: '100%', maxWidth: '850px', maxHeight: '90vh' }}>
          <div className="d-flex justify-content-between align-items-center p-4 border-bottom">
            <h5 className="m-0 text-dark fw-bold">Manage Permissions</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="p-4" style={{ overflowY: 'auto' }}>
            <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h6 className="fw-bold mb-3 d-flex align-items-center">
                <Layers size={18} className="me-2 text-primary" />
                Table Permissions
              </h6>
              <div className="p-3 border rounded mb-4 shadow-sm bg-light">
                <div className="row g-3">
                  {["cpm", "spent","cpc"].map((perm) => (
                    <div className="col-4" key={perm}>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`perm-${perm}`}
                          value={perm}
                          checked={permissions.includes(perm)}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label fw-medium text-capitalize" htmlFor={`perm-${perm}`}>
                          {perm}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <h6 className="fw-bold mb-3 d-flex align-items-center">
                <Shield size={18} className="me-2 text-success" />
                Widget Permissions
              </h6>
              <div className="p-3 border rounded shadow-sm bg-light">
                 <div className="row g-3">
                  {[
                    "performance_graph", 
                    "performance_table",
                    "delivery_by_weekday",
                    "creative_performance_graph",
                    "platform_gender",
                    "platform_age", 
                    "operator_distribution",
                    "browser_distribution", 
                    "device_distribution", 
                    "browser_graph",
                    "browser_table",
                    "operator_graph",
                    "operator_table",
                    "os_distribution",
                    "os_graph",
                    "os_table",
                    "placement_pos_distribution",
                    "placement_interstitial_distribution",
                    "creative_performance_graph_table",
                  ].map((perm) => (
                    <div className="col-4" key={perm}>
                      <div className="form-check">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id={`perm-${perm}`}
                          value={perm}
                          checked={permissions.includes(perm)}
                          onChange={handleCheckboxChange}
                        />
                        <label className="form-check-label fw-medium text-capitalize" htmlFor={`perm-${perm}`}>
                          {perm.replace(/_/g, " ")}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary px-4"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary px-4">
                Save Permissions
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default PermissionModal;

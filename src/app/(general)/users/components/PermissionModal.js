"use client";
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

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
      <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
        <div className="bg-white rounded shadow p-4" style={{ width: '90%', maxWidth: '500px' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="m-0">Manage Permissions</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label d-block text-muted mb-3">Select sections to allow for this user:</label>
              
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="perm-cpm"
                  value="cpm"
                  checked={permissions.includes("cpm")}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="perm-cpm">
                  CPM
                </label>
              </div>
              
              <div className="form-check mb-2">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="perm-spent"
                  value="spent"
                  checked={permissions.includes("spent")}
                  onChange={handleCheckboxChange}
                />
                <label className="form-check-label" htmlFor="perm-spent">
                  Spent
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Permissions
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PermissionModal;

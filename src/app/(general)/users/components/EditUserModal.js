"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const EditUserModal = ({ show, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({ email: "", role: "" });
    const router = useRouter();

  // Sync when user changes
  useEffect(() => {
    if (user) {
      setFormData({ email: user.email || "", role: user.role || "" });
    }
  }, [user]);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user._id, formData);
  };

  const handleClose=()=>{
    router.push("/users")
    onClose()
  }

  return (
    <>
      <div className="modal fade show d-block" tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content shadow-lg">
            <div className="modal-header bg-primary text-white">
              <h5 className="modal-title">Edit User</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
              >

              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="super_admin">super_admin</option>
                    <option value="user">user</option>
              
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Custom backdrop */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100"
        style={{ background: "rgba(0,0,0,0.5)", zIndex: 1040 }}
        onClick={onClose}
      />
    </>
  );
};

export default EditUserModal;

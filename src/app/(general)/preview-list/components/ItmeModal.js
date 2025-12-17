import React from "react";
import { X } from "lucide-react";

const ItemModal = ({
  title,
  formData,
  handleInputChange,
  onClose,
  onSubmit,
  submitLabel,
  removeFile, 
}) => {
  return (
    <div className="modal d-block" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label>Name</label>
              <input
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3">
              <label>Description</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3">
              <label>Preview URL</label>
              <input
                className="form-control"
                name="previewUrl"
                value={formData.previewUrl}
                onChange={handleInputChange}
              />
            </div>

            {/* File Upload with Preview */}
            <div className="mb-3">
              <label>Upload File</label>
              {!formData.file ? (
                <input
                  type="file"
                  className="form-control"
                  name="file"
                  accept="image/*"
                  onChange={handleInputChange}
                />
              ) : (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <img
                    src={URL.createObjectURL(formData.file)}
                    alt="Uploaded"
                    width={60}
                    height={60}
                    className="rounded"
                    style={{ objectFit: "cover" }}
                  />
                  <span>{formData.file.name}</span>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={removeFile}
                  >
                    <X size={16} /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button className="btn btn-primary" onClick={onSubmit}>
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;

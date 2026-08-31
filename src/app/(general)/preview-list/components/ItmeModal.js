import React from "react";
import { X, ExternalLink } from "lucide-react";

const ItemModal = ({
  title,
  formData,
  handleInputChange,
  onClose,
  onSubmit,
  submitLabel,
  removeFile, 
  audiences = [],
}) => {
  const getMediaType = (url, desc, explicitType) => {
    let type = explicitType || 'link';
    if (!type || type === 'link') {
      const d = (desc || "").toLowerCase();
      if (d.includes("audio")) type = "audio";
      else if (d.includes("video")) type = "video";
      else if (d.includes("banner") || d.includes("image")) type = "image";
      else if (d.includes("ctv")) type = "ctv";
      else if (d.includes("rich-media")) type = "rich-media";
      else if (url?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) type = "image";
      else if (url?.match(/\.(mp4|webm|ogg)$/i)) type = "video";
      else if (url?.match(/\.(mp3|wav|ogg)$/i)) type = "audio";
    }
    return type;
  };

  const getSafeIframeUrl = (url) => {
    if (!url) return "";
    if (url.includes("<iframe") && url.includes("src=")) {
      const match = url.match(/src=["'](.*?)["']/);
      return match ? match[1] : url;
    }
    return url;
  };

  const mediaType = formData.previewUrl ? getMediaType(formData.previewUrl, formData.description, formData.type) : 'link';

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
              <label>Audience</label>
              <select
                className="form-select"
                name="audienceId"
                value={formData.audienceId || ""}
                onChange={handleInputChange}
              >
                <option value="">-- No Audience Linked --</option>
                {audiences.map((aud) => (
                  <option key={aud._id || aud.dv360AudienceId || aud.id} value={aud._id || aud.dv360AudienceId || aud.id}>
                    {aud.displayName || aud.reportName || aud.advertiserId} {aud.dv360AudienceId ? `(${aud.dv360AudienceId})` : ""}
                  </option>
                ))}
              </select>
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

            {/* Media Upload / Preview Section */}
            <div className="mb-3">
              <label>Media File</label>
              
              {!formData.file && !formData.previewUrl ? (
                <input
                  type="file"
                  className="form-control"
                  name="file"
                  onChange={handleInputChange}
                />
              ) : (
                <div className="d-flex flex-column gap-2 mt-2 p-3 border rounded bg-light position-relative">
                   {formData.file ? (
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="text-truncate fw-medium" style={{ maxWidth: '80%' }}>{formData.file.name}</span>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={removeFile}
                      >
                        <X size={16} /> Remove
                      </button>
                    </div>
                  ) : (
                    <div className="d-flex flex-column align-items-center justify-content-center w-100" style={{ minHeight: '100px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden', padding: mediaType === 'audio' ? '20px' : '0' }}>
                      {mediaType === 'image' && <img src={formData.previewUrl} className="img-fluid" style={{ maxHeight: '180px', objectFit: 'contain' }} alt="Preview" />}
                      {mediaType === 'video' && <video src={formData.previewUrl} controls className="w-100" style={{ maxHeight: '180px' }} />}
                      {(mediaType === 'ctv' || mediaType === 'rich-media') && (
                        <div className="w-100 d-flex flex-column align-items-center">
                          {formData.previewUrl?.includes("<iframe") ? (
                             <div className="w-100" style={{ height: '180px', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: formData.previewUrl }} />
                          ) : (
                             <iframe src={getSafeIframeUrl(formData.previewUrl)} width="100%" height="180px" style={{ border: 'none' }} allowFullScreen />
                          )}
                          <a href={getSafeIframeUrl(formData.previewUrl)} target="_blank" rel="noreferrer" className="btn btn-sm btn-link mt-1 p-0 fw-bold" style={{ fontSize: '0.8rem' }}>Open in New Tab <ExternalLink size={12}/></a>
                        </div>
                      )}
                      {mediaType === 'audio' && <audio src={formData.previewUrl} controls className="w-100" />}
                      {mediaType === 'link' && <a href={formData.previewUrl} target="_blank" rel="noreferrer" className="fw-bold text-primary">View Current Link</a>}
                      
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 rounded p-1 shadow-sm"
                        onClick={() => handleInputChange({ target: { name: 'previewUrl', value: '' } })}
                        title="Remove current media to upload new one"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
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

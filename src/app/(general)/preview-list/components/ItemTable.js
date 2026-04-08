import React, { useState } from "react";
import {
  Pencil,
  Trash2,
  AlertCircle,
  File,
  Check,
  X,
  ExternalLink,
  PlaySquare,
} from "lucide-react";

const ItemTable = ({
  items,
  setFormData,
  setShowEdit,
  deleteConfirm,
  setDeleteConfirm,
  handleDelete,
  isEditable = true,
  page = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const [previewMedia, setPreviewMedia] = useState(null);

  const handlePreviewClick = (e, item) => {
    e.preventDefault();
    const desc = (item.description || "").toLowerCase();
    let type = "link";
    if (desc.includes("audio")) type = "audio";
    else if (desc.includes("video")) type = "video";
    else if (desc.includes("banner") || desc.includes("image")) type = "image";
    else if (desc.includes("ctv")) type = "ctv";
    else if (desc.includes("rich-media")) type = "rich-media";
    else {
      if (item.previewUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i)) type = "image";
      else if (item.previewUrl?.match(/\.(mp4|webm|ogg)$/i)) type = "video";
      else if (item.previewUrl?.match(/\.(mp3|wav|ogg)$/i)) type = "audio";
    }

    if (type !== "link") {
      setPreviewMedia({ url: item.previewUrl, type });
    } else {
      window.open(item.previewUrl, "_blank");
    }
  };

  const getSafeIframeUrl = (url) => {
    if (!url) return "";
    if (url.includes("<iframe") && url.includes("src=")) {
      const match = url.match(/src=["'](.*?)["']/);
      return match ? match[1] : url;
    }
    return url;
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead style={{ backgroundColor: "#f8fafc" }}>
          <tr className="border-bottom">
            <th
              className="ps-4 py-3 text-muted fw-semibold"
              style={{ fontSize: "0.85rem" }}
            >
              Name
            </th>
            <th
              className="py-3 text-muted fw-semibold"
              style={{ fontSize: "0.85rem" }}
            >
              Details
            </th>
            <th
              className="py-3 text-muted fw-semibold"
              style={{ fontSize: "0.85rem" }}
            >
              Preview URL
            </th>
            <th
              className="py-3 text-muted fw-semibold"
              style={{ fontSize: "0.85rem" }}
            >
              Source
            </th>
            {isEditable && (
              <th
                className="text-end pe-4 py-3 text-muted fw-semibold"
                style={{ fontSize: "0.85rem" }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="border-0">
          {items.length === 0 ? (
            <tr>
              <td colSpan={isEditable ? "5" : "4"} className="text-center py-5">
                <div className="py-4">
                  <AlertCircle
                    size={40}
                    className="text-muted opacity-25 mb-3"
                  />
                  <h6 className="fw-bold">No items found</h6>
                  <p className="text-muted small">
                    Start by creating your first creative set
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-bottom border-light">
                <td className="ps-4 py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-light rounded-2 d-flex align-items-center justify-content-center"
                      style={{ width: "36px", height: "36px" }}
                    >
                      <File size={18} className="text-secondary" />
                    </div>
                    <div>
                      <div
                        className="fw-bold text-dark"
                        style={{ fontSize: "0.95rem" }}
                      >
                        {item.name}
                      </div>
                      <div className="text-muted small">
                        ID: {item.id.toString().slice(-6)}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 text-muted" style={{ fontSize: "0.85rem" }}>
                  {item.description || "-"}
                </td>
                <td className="py-3">
                  {item.previewUrl ? (
                    <a
                      href={item.previewUrl}
                      onClick={(e) => handlePreviewClick(e, item)}
                      className="d-flex align-items-center gap-1 text-decoration-none cursor-pointer"
                      style={{
                        color: "#6b46c1",
                        fontWeight: "500",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      View Preview <PlaySquare size={14} />
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3">
                  <span
                    className="badge rounded-pill bg-light text-secondary px-3 py-2 border"
                    style={{ fontSize: "0.75rem", fontWeight: "600" }}
                  >
                    {item.source || "Manual"}
                  </span>
                </td>
                {isEditable && (
                  <td className="text-end pe-4 py-3">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="btn btn-sm btn-light p-2 rounded-2 hover-shadow"
                        onClick={() => {
                          setShowEdit(item);
                          setFormData(item);
                        }}
                        title="Edit"
                      >
                        <Pencil size={16} className="text-primary" />
                      </button>

                      {deleteConfirm === item.id ? (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-sm btn-danger px-3"
                            onClick={() => handleDelete(item.id)}
                          >
                            Confirm
                          </button>
                          <button
                            className="btn btn-sm btn-light"
                            onClick={() => setDeleteConfirm(null)}
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn btn-sm btn-light p-2 rounded-2 hover-shadow"
                          onClick={() => setDeleteConfirm(item.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} className="text-danger" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center p-3 border-top bg-white rounded-bottom">
          <span className="text-muted small">
            Page {page} of {totalPages}
          </span>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page <= 1}
              onClick={() => onPageChange && onPageChange(page - 1)}
            >
              Previous
            </button>
            <button
              className="btn btn-sm btn-outline-secondary"
              disabled={page >= totalPages}
              onClick={() => onPageChange && onPageChange(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="modal d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content overflow-hidden border-0 shadow">
              <div className="modal-header border-bottom-0 bg-light">
                <h6 className="modal-title fw-bold text-dark m-0">
                  Media Preview
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPreviewMedia(null)}
                ></button>
              </div>
              <div
                className="modal-body text-center p-0 bg-dark d-flex align-items-center justify-content-center"
                style={{ minHeight: "300px" }}
              >
                {previewMedia.type === "image" && (
                  <img
                    src={previewMedia.url}
                    className="img-fluid"
                    alt="Preview"
                    style={{ maxHeight: "70vh", objectFit: "contain" }}
                  />
                )}
                {previewMedia.type === "video" && (
                  <video
                    src={previewMedia.url}
                    controls
                    autoPlay
                    className="w-100"
                    style={{ maxHeight: "70vh" }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                {(previewMedia.type === "ctv" ||
                  previewMedia.type === "rich-media") && (
                  <div className="w-100 bg-white d-flex flex-column">
                    <div
                      className="d-flex justify-content-between align-items-center p-2 border-bottom"
                      style={{ backgroundColor: "#f8fafc" }}
                    >
                      <span className="small text-muted fw-bold ps-2">
                        {previewMedia.type === "ctv" ? "CTV" : "Rich Media"}{" "}
                        Preview
                      </span>
                      <a
                        href={getSafeIframeUrl(previewMedia.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-primary py-1 px-2 d-flex align-items-center"
                        style={{
                          fontSize: "0.75rem",
                          backgroundColor: "#6b46c1",
                          border: "none",
                        }}
                      >
                        <ExternalLink size={12} className="me-1" /> Open in New
                        Tab
                      </a>
                    </div>
                    {previewMedia.url?.includes("<iframe") ? (
                      // Case 1: Full HTML embed string
                      <div
                        className="video-container"
                        style={{ width: "100%", height: "400px" }}
                        dangerouslySetInnerHTML={{ __html: previewMedia.url }}
                      />
                    ) : (
                      // Case 2: Plain URL
                      <iframe
                        src={getSafeIframeUrl(previewMedia.url)}
                        title="Preview Content"
                        width="100%"
                        height="400px"
                        style={{ border: "none" }}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation allow-forms"
                        allowFullScreen
                      />
                    )}
                  </div>
                )}
                {previewMedia.type === "audio" && (
                  <div
                    className="w-100 p-5 d-flex flex-column align-items-center justify-content-center"
                    style={{ minHeight: "200px" }}
                  >
                    <div className="mb-4 text-white opacity-75">
                      <PlaySquare size={48} />
                    </div>
                    <audio
                      src={previewMedia.url}
                      controls
                      autoPlay
                      className="w-75"
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .table-hover tbody tr:hover {
          background-color: #fcfaff !important;
        }
        .hover-shadow:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background-color: white !important;
        }
        .text-primary {
          color: #6b46c1 !important;
        }
      `}</style>
    </div>
  );
};

export default ItemTable;

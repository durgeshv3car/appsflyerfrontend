import React from "react";
import { Pencil, Trash2, AlertCircle, File, Check, X, ExternalLink } from "lucide-react";

const ItemTable = ({
  items,
  setFormData,
  setShowEdit,
  deleteConfirm,
  setDeleteConfirm,
  handleDelete,
  isEditable = true,
}) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead style={{ backgroundColor: "#f8fafc" }}>
          <tr className="border-bottom">
            <th className="ps-4 py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Name</th>
            <th className="py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Details</th>
            <th className="py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Preview URL</th>
            <th className="py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Source</th>
            {isEditable && <th className="text-end pe-4 py-3 text-muted fw-semibold" style={{ fontSize: "0.85rem" }}>Actions</th>}
          </tr>
        </thead>
        <tbody className="border-0">
          {items.length === 0 ? (
            <tr>
              <td colSpan={isEditable ? "5" : "4"} className="text-center py-5">
                <div className="py-4">
                  <AlertCircle size={40} className="text-muted opacity-25 mb-3" />
                  <h6 className="fw-bold">No items found</h6>
                  <p className="text-muted small">Start by creating your first creative set</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id} className="border-bottom border-light">
                <td className="ps-4 py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <File size={18} className="text-secondary" />
                    </div>
                    <div>
                      <div className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>{item.name}</div>
                      <div className="text-muted small">ID: {item.id.toString().slice(-6)}</div>
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
                      target="_blank"
                      rel="noreferrer"
                      className="d-flex align-items-center gap-1 text-decoration-none"
                      style={{ color: "#6b46c1", fontWeight: "500", fontSize: "0.85rem" }}
                    >
                      View Preview <ExternalLink size={14} />
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="py-3">
                   <span className="badge rounded-pill bg-light text-secondary px-3 py-2 border" style={{ fontSize: '0.75rem', fontWeight: '600' }}>
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
      <style jsx>{`
        .table-hover tbody tr:hover {
          background-color: #fcfaff !important;
        }
        .hover-shadow:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          background-color: white !important;
        }
        .text-primary { color: #6b46c1 !important; }
      `}</style>
    </div>
  );
};

export default ItemTable;

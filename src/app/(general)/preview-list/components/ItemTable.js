import React from "react";
import { Pencil, Trash2, AlertCircle, File, Check, X } from "lucide-react";

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
      <table className="table table-hover align-middle">
        <thead className="table-light">
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Description</th>
            <th>Preview URL</th>
            <th>File</th>
            {isEditable && <th className="text-end">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={isEditable ? "6" : "5"} className="text-center py-5">
                <div>
                  <AlertCircle size={40} className="text-secondary mb-2" />
                  <h5>No items found</h5>
                  <p className="text-muted">Start by creating a new item</p>
                </div>
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>
                  {item.logo && typeof item.logo !== "string" ? (
                    <img
                      src={URL.createObjectURL(item.logo)}
                      alt="Logo"
                      width={40}
                      height={40}
                      style={{ objectFit: "cover", borderRadius: "5px" }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td className="fw-semibold">{item.name}</td>
                <td>{item.description || "-"}</td>
                <td>
                  {item.previewUrl ? (
                    <a
                      href={item.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {item.previewUrl}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>
                  {item.file ? (
                    <div className="d-flex align-items-center gap-1">
                      <File size={16} /> {item.file.name}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                {isEditable && (
                  <td className="text-end d-flex justify-content-end gap-2 flex-wrap">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => {
                        setShowEdit(item);
                        setFormData(item);
                      }}
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    {deleteConfirm === item.id ? (
                      <>
                        <span className="align-self-center text-danger">
                          Delete?
                        </span>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setDeleteConfirm(null)}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => setDeleteConfirm(item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ItemTable;

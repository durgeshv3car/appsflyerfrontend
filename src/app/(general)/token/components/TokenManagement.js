"use client";
import React, { useEffect, useState } from "react";
import { Plus, Search, Key, Mail, Edit, Trash2, Copy, Check } from "lucide-react";
import { getAllToken, deleteToken } from "@/services/token";
import TokenModal from "./TokenModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { jwtDecode } from "jwt-decode";

const extractEmailFromItem = (item) => {
  if (!item || typeof item !== "object") return "N/A";

  // 1. Direct property checks
  const keys = [
    "email", "gmail", "userEmail", "user_email", "mail",
    "assignedEmail", "clientEmail", "accountEmail"
  ];
  for (const k of keys) {
    if (typeof item[k] === "string" && item[k].trim() && item[k].includes("@")) {
      return item[k].trim();
    }
  }

  // 2. Check array properties (e.g. emails, users)
  const arrayKeys = ["emails", "email", "gmail", "users", "assignedTo"];
  for (const k of arrayKeys) {
    if (Array.isArray(item[k]) && item[k].length > 0) {
      const first = item[k][0];
      if (typeof first === "string" && first.includes("@")) return first.trim();
      if (typeof first === "object" && first !== null) {
        const e = first.email || first.gmail || first.userEmail;
        if (typeof e === "string" && e.includes("@")) return e.trim();
      }
    }
  }

  // 3. Nested user object checks
  const objKeys = ["user", "userId", "owner", "createdBy", "assignedUser"];
  for (const k of objKeys) {
    if (item[k] && typeof item[k] === "object") {
      const e = item[k].email || item[k].gmail || item[k].userEmail;
      if (typeof e === "string" && e.trim() && e.includes("@")) {
        return e.trim();
      }
    }
  }

  // 4. Try JWT decoding if token or campaign_name is an encoded JWT (starts with eyJ)
  const tokStr = item.token || item.campaign_name || item.reportName || "";
  if (typeof tokStr === "string" && tokStr.startsWith("eyJ")) {
    try {
      const decoded = jwtDecode(tokStr);
      if (decoded?.email && typeof decoded.email === "string" && decoded.email.includes("@")) {
        return decoded.email.trim();
      }
      if (decoded?.gmail && typeof decoded.gmail === "string" && decoded.gmail.includes("@")) {
        return decoded.gmail.trim();
      }
      if (decoded?.user?.email && typeof decoded.user.email === "string" && decoded.user.email.includes("@")) {
        return decoded.user.email.trim();
      }
      if (decoded?.sub && typeof decoded.sub === "string" && decoded.sub.includes("@")) {
        return decoded.sub.trim();
      }
    } catch (e) {}
  }

  // 5. Fallback: Deep scan all values in item object for a valid email string containing '@'
  for (const key of Object.keys(item)) {
    const val = item[key];
    if (typeof val === "string" && val.includes("@") && val.includes(".")) {
      return val.trim();
    }
  }

  return "N/A";
};

const extractTokenFromItem = (item) => {
  if (!item || typeof item !== "object") return "N/A";

  const keys = ["token", "token_key", "tokenKey", "campaign_name", "reportName", "name", "tokenVal", "key"];
  for (const k of keys) {
    if (typeof item[k] === "string" && item[k].trim()) {
      return item[k].trim();
    }
  }

  if (item._id && typeof item._id === "string") return item._id;
  if (item.id && typeof item.id === "string") return item.id;

  return "N/A";
};

export default function TokenManagement() {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const res = await getAllToken();
      const list = Array.isArray(res) ? res : res.data || res.tokens || [];
      setTokens(list);
    } catch (error) {
      console.error("Error loading tokens:", error);
      toast.error("Failed to load tokens from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleOpenAddModal = () => {
    setEditingToken(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingToken(item);
    setShowModal(true);
  };

  const handleDelete = (item) => {
    const id = item._id || item.id;
    const itemEmail = extractEmailFromItem(item);

    Swal.fire({
      title: "Delete Token?",
      text: `Are you sure you want to delete token for "${itemEmail !== "N/A" ? itemEmail : "this token"}"? This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-4",
        confirmButton: "rounded-3 px-4",
        cancelButton: "rounded-3 px-4",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteToken(id);
          toast.success("Token deleted successfully");
          fetchTokens();
        } catch (err) {
          console.error("Failed to delete token:", err);
          toast.error("Failed to delete token.");
        }
      }
    });
  };

  const handleCopyToken = (tokenStr, id) => {
    if (!tokenStr || tokenStr === "N/A") return;
    navigator.clipboard.writeText(tokenStr);
    setCopiedId(id);
    toast.info("Token copied to clipboard!", { autoClose: 2000 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered tokens based on search
  const filteredTokens = tokens.filter((t) => {
    const searchLower = searchTerm.toLowerCase();
    const e = extractEmailFromItem(t).toLowerCase();
    const tok = extractTokenFromItem(t).toLowerCase();
    return e.includes(searchLower) || tok.includes(searchLower);
  });

  return (
    <div className="container-fluid py-4 px-4">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Page Header */}
      <div className="row align-items-center mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 p-3 text-white shadow-sm"
              style={{ background: "linear-gradient(135deg, #031035 0%, #1a2b5a 100%)" }}
            >
              <Key size={26} />
            </div>
            <div>
              <h4 className="fw-bold mb-1 text-dark">Token Management</h4>
              <p className="text-muted mb-0 small">
                Manage Email addresses and API Tokens stored in database
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-6 d-flex align-items-center justify-content-md-end gap-2">
          <button
            className="btn text-white rounded-3 d-flex align-items-center gap-2 px-3"
            style={{ background: "#031035" }}
            onClick={handleOpenAddModal}
          >
            <Plus size={18} />
            <span className="fw-medium">Add Token</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
        {/* Card Header with Search */}
        <div className="card-header bg-white border-0 py-3 px-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <h6 className="fw-bold mb-0 text-dark">Stored Token Records</h6>

          <div className="position-relative" style={{ maxWidth: "320px", width: "100%" }}>
            <Search
              size={16}
              className="position-absolute text-muted"
              style={{ left: "12px", top: "50%", transform: "translateY(-50%)" }}
            />
            <input
              type="text"
              className="form-control form-control-sm ps-5 pe-3 rounded-3 bg-light"
              placeholder="Search by Email or Token..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Card Body & Table */}
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light border-bottom">
              <tr>
                <th style={{ width: "60px" }} className="ps-4">#</th>
                <th style={{ minWidth: "220px" }}>Email</th>
                <th>Token</th>
                <th style={{ width: "140px" }} className="text-center pe-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">Fetching token data...</p>
                  </td>
                </tr>
              ) : filteredTokens.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-5">
                    <div className="text-muted">
                      <Key size={36} className="mb-2 opacity-50" />
                      <p className="fw-medium mb-1">No tokens found</p>
                      <small>
                        {searchTerm ? "No tokens match your search query." : "Click 'Add Token' to create a new Email & Token record."}
                      </small>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTokens.map((item, index) => {
                  const id = item._id || item.id || index;
                  const itemEmail = extractEmailFromItem(item);
                  const itemToken = extractTokenFromItem(item);

                  return (
                    <tr key={id}>
                      <td className="ps-4 text-muted fw-medium">{index + 1}</td>

                      {/* Email Column */}
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <span
                            className="d-inline-flex align-items-center justify-content-center rounded-circle p-2"
                            style={{ background: "#eef2ff", color: "#3730a3" }}
                          >
                            <Mail size={16} />
                          </span>
                          <span className="fw-semibold text-dark">{itemEmail}</span>
                        </div>
                      </td>

                      {/* Token Column */}
                      <td>
                        <div className="d-flex align-items-center gap-2" style={{ maxWidth: "450px" }}>
                          <code
                            className="bg-light px-3 py-1 rounded-3 text-dark font-monospace text-truncate d-inline-block border"
                            style={{ fontSize: "0.85rem", maxWidth: "350px" }}
                            title={itemToken}
                          >
                            {itemToken}
                          </code>
                          <button
                            type="button"
                            className={`btn btn-sm ${copiedId === id ? "btn-success" : "btn-light border"} p-1 px-2 rounded-2`}
                            onClick={() => handleCopyToken(itemToken, id)}
                            title="Copy Token to clipboard"
                          >
                            {copiedId === id ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </div>
                      </td>

                      {/* Actions Column: Edit & Delete */}
                      <td className="pe-4 text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary rounded-3 d-flex align-items-center justify-content-center px-2 py-1"
                            onClick={() => handleOpenEditModal(item)}
                            title="Edit Token & Email"
                          >
                            <Edit size={15} />
                          </button>

                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger rounded-3 d-flex align-items-center justify-content-center px-2 py-1"
                            onClick={() => handleDelete(item)}
                            title="Delete Token"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add / Edit */}
      <TokenModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={fetchTokens}
        initialData={editingToken}
      />
    </div>
  );
}

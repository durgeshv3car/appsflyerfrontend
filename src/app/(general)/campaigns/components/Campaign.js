"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Copy,
  Trash2,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  ArrowRight,
  Search,
} from "lucide-react";
import { deleteToken, getAllToken } from "@/services/token";

const CampaignTable = () => {
  const router = useRouter();
  const [tokenData, setTokenData] = useState([]);
  const [copiedStates, setCopiedStates] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [showTokens, setShowTokens] = useState({});
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showPasswords, setShowPasswords] = useState({});

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates((prev) => ({ ...prev, [id]: true }));
      setTimeout(
        () => setCopiedStates((prev) => ({ ...prev, [id]: false })),
        2000
      );
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const getTokenData = async () => {
    const res = await getAllToken();
    if (res.message) {
      setTokenData(res.tokenData);
    }
  };

  useEffect(() => {
    getTokenData();
  }, []);

  const handleDelete = async (id) => {
    const res = await deleteToken(id);
    if (res) {
      setDeleteConfirm(null);
      getTokenData();
    }
  };
  const toggleTokenVisibility = (campaign_name, token) => {
    router.push(`/Lms?c_id=${campaign_name}&t_id=${token}`);
  };
  const togglePasswordVisibility = (id) => {
  setShowPasswords((prev) => ({
    ...prev,
    [id]: !prev[id],
  }));
};

  const truncateToken = (token, show = false) => {
    if (show) return token;
    return token.substring(0, 20) + "..." + token.substring(token.length - 10);
  };

  const handleSendMail = (campaign_name, token) => {
    console.log("Send Mail Clicked:", { campaign_name, token });
    // Here you can integrate your mail API
  };

  const handleNavigate = (id) => {
    router.push(`/campaign-details?id=${id}`);
  };

  const filteredData = tokenData.filter(
    (item) =>
      item.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="display-5">Campaign Tokens</h1>
        <p className="text-muted">Manage your campaign authentication tokens</p>
      </div>

      {/* Search & Count */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between mb-3 gap-2">
        <div className="input-group" style={{ maxWidth: "400px" }}>
          <span className="input-group-text">
            <Search size={16} />
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Search campaigns or emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="badge bg-primary fs-6">
          {filteredData.length} tokens
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Campaign</th>
              <th>Email</th>
              <th>Token</th>
              <th>Password</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-5">
                  <div>
                    <AlertCircle size={40} className="text-secondary mb-2" />
                    <h5>No tokens found</h5>
                    <p className="text-muted">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No campaign tokens available"}
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {filteredData.map((item) => (
              <tr key={item._id}>
                <td>
                  <div className="d-flex align-items-center">
                    <div
                      className="bg-primary text-white rounded me-3 d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                    >
                      {item.campaign_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold">{item.campaign_name}</div>
                      <small className="text-muted">
                        {item._id.substring(0, 8)}...
                      </small>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div
                      className="bg-success text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                      style={{ width: "30px", height: "30px" }}
                    >
                      @
                    </div>
                    <span>{item.email}</span>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <code className="bg-light px-2 py-1 rounded">
                      {truncateToken(item.token, showTokens[item._id])}
                    </code>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() =>
                        toggleTokenVisibility(item.campaign_name, item.token)
                      }
                    >
                      {showTokens[item._id] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => copyToClipboard(item.token, item._id)}
                    >
                      {copiedStates[item._id] ? (
                        <Check size={16} className="text-success" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>
                </td>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <code className="bg-light px-2 py-1 rounded">
                      {showPasswords[item._id] ? item.password : "••••••••"}
                    </code>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => togglePasswordVisibility(item._id)}
                    >
                      {showPasswords[item._id] ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </td>
                <td className="text-end d-flex justify-content-end gap-2 flex-wrap">
                  {/* Send Mail Button */}
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() =>
                      handleSendMail(item.campaign_name, item.token)
                    }
                  >
                    <Mail size={16} /> Send Mail
                  </button>

                  {/* Navigate Button */}
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handleNavigate(item._id)}
                  >
                    <ArrowRight size={16} /> Details
                  </button>

                  {/* Delete Button */}
                  {deleteConfirm === item._id ? (
                    <>
                      <span className="align-self-center text-danger">
                        Delete?
                      </span>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(item._id)}
                      >
                        Yes
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => setDeleteConfirm(null)}
                      >
                        No
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setDeleteConfirm(item._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Toast */}
      {Object.values(copiedStates).some((state) => state) && (
        <div className="position-fixed bottom-0 end-0 m-3">
          <div className="toast show align-items-center text-white bg-success border-0">
            <div className="d-flex">
              <div className="toast-body d-flex align-items-center gap-2">
                <Check size={16} /> Token copied to clipboard!
              </div>
              <button
                type="button"
                className="btn-close btn-close-white me-2 m-auto"
                onClick={() => setCopiedStates({})}
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignTable;

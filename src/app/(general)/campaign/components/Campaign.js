"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Trash2,
  AlertCircle,
  ArrowRight,
  Search,
  Plus,
  Pen,
  X,
  Mail,
  UserPlus,
} from "lucide-react";
import {
  deleteToken,
  getAllToken,
  createToken,
  updateToken,
  addEmail,
} from "@/services/campaign";

const CampaignTable = () => {
  const router = useRouter();
  const [tokenData, setTokenData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    campaign_name: "",
    advertiseId: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Modal State for Add Email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({ id: "", email: "" });

  const handleOpenEmailModal = (id) => {
    setEmailData({ id, email: "" });
    setError("");
    setShowEmailModal(true);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
        await addEmail(emailData.id, emailData.email);
        setShowEmailModal(false);
        toast.success("Email added successfully!");
    } catch (err) {
        setError("Failed to add email.");
        console.error(err);
        toast.error("Failed to add email.");
    } finally {
        setLoading(false);
    }
  };

  const getTokenData = async () => {
    try {
      const res = await getAllToken();
      console.log("API Response:", res); // Debugging log

      if (res?.tokenData) {
        setTokenData(res.tokenData);
      } else if (res?.campaignData) {
        setTokenData(res.campaignData);
      } else if (Array.isArray(res)) {
        setTokenData(res);
      } else {
        console.warn("Unexpected response format:", res);
        // Fallback: check if it's an object with a data property that is an array
        if (res?.data && Array.isArray(res.data)) {
           setTokenData(res.data);
        }
      }
    } catch (err) {
      console.error("Error fetching token data:", err);
    }
  };

  useEffect(() => {
    getTokenData();
  }, []);

  const handleDelete = async (id) => {
    try {
        const res = await deleteToken(id);
        if (res) {
          setDeleteConfirm(null);
          toast.success("Campaign deleted successfully");
          getTokenData();
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to delete campaign");
    }
  };

  const handleNavigate = (id) => {
    router.push(`/campaign-details?id=${id}`);
  };

  // Modal Handlers
  const handleAdd = () => {
    setFormData({ id: "", campaign_name: "", advertiseId: "" });
    setIsEditing(false);
    setError("");
    setShowModal(true);
  };

  const handleEdit = (item) => {
    setFormData({
      id: item._id,
      campaign_name: item.campaign_name,
      advertiseId: item.advertiseId || "",
    });
    setIsEditing(true);
    setError("");
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditing) {
        await updateToken(formData.id, formData.campaign_name, formData.advertiseId);
        toast.success("Campaign updated successfully");
      } else {
        await createToken(formData.campaign_name, formData.advertiseId);
        toast.success("Campaign created successfully");
      }
      setShowModal(false);
      getTokenData();
    } catch (err) {
      setError("Failed to save campaign. Please try again.");
      toast.error("Failed to save campaign.");
    } finally {
      setLoading(false);
    }
  };

  const filteredData = tokenData.filter(
    (item) =>
      item.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.advertiseId && item.advertiseId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container my-5 position-relative">
      <ToastContainer />
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="display-5">Campaigns</h1>
          <p className="text-muted">Manage your campaigns</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleAdd}>
          <Plus size={20} /> Add Campaign
        </button>
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
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="badge bg-primary fs-6">
          {filteredData.length} campaigns
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Campaign</th>
              <th>Advertiser ID</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 && (
              <tr>
                <td colSpan="3" className="text-center py-5">
                  <div>
                    <AlertCircle size={40} className="text-secondary mb-2" />
                    <h5>No campaigns found</h5>
                    <p className="text-muted">
                      {searchTerm
                        ? "Try adjusting your search terms"
                        : "No campaigns available"}
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
                    </div>
                  </div>
                </td>
                <td>
                  <span className="fw-medium">{item.advertiseId || "N/A"}</span>
                </td>
                <td className="text-end d-flex justify-content-end gap-2 flex-wrap">
                  {/* Add Email Button (User Icon) */}
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleOpenEmailModal(item._id)}
                  >
                    <UserPlus size={16} /> User
                  </button>

                  {/* Edit Button */}
                  <button
                    className="btn btn-sm btn-outline-success"
                    onClick={() => handleEdit(item)}
                  >
                    <Pen size={16} /> Edit
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

      {/* Modal - Basic Overlay Implementation */}
      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="bg-white rounded shadow p-4" style={{ width: '100%', maxWidth: '500px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">{isEditing ? 'Edit Campaign' : 'Add New Campaign'}</h4>
              <button className="btn btn-link text-dark p-0" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label">Campaign Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.campaign_name}
                  onChange={(e) => setFormData({ ...formData, campaign_name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Advertiser ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.advertiseId}
                  onChange={(e) => setFormData({ ...formData, advertiseId: e.target.value })}
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : (isEditing ? 'Update Campaign' : 'Create Campaign')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal - Add Email */}
      {showEmailModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
          <div className="bg-white rounded shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">Add Email to Campaign</h4>
              <button className="btn btn-link text-dark p-0" onClick={() => setShowEmailModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleEmailSubmit}>
              <div className="mb-3">
                <label className="form-label">User Email</label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="Enter user email"
                  value={emailData.email}
                  onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                  required
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEmailModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignTable;

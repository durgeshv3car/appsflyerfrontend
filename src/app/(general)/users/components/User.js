"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, User, Layers, X } from "lucide-react";
import EditUserModal from "./EditUserModal";
import { useRouter } from "next/navigation";
import { deleteUser, getAllUsers, removeUserAudience } from "@/services/users";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function UserPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

    const getUserData = async () => {

      const res = await getAllUsers();
      if (res.message) {
        setUsers(res.userData);
      }
    };

    useEffect(()=>{
      getUserData()
    },[])

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedUserCampaigns, setSelectedUserCampaigns] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");

  const handleShowCampaigns = (user) => {
    setSelectedUserCampaigns(user.campaignId || []);
    setSelectedUserEmail(user.email);
    setShowCampaignModal(true);
  };

  const handleEdit = (id,user) => {
    router.push(`/users?id=${id}`)
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSave = (_id, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === _id ? { ...u, ...updatedData } : u))
    );
    setShowModal(false);
    toast.success("User updated successfully");
  };

  const handleDelete = async (id) => {
    try {
        const res = await deleteUser(id);
        if (res.message) {
          getUserData();
          toast.success("User deleted successfully");
        }
    } catch (error) {
        console.error(error);
        toast.error("Failed to delete user");
    }
  };

  const handleRemoveCampaign = async (campaignId) => {
    if(!confirm("Are you sure you want to remove this campaign?")) return;
    
    try {
        const res = await removeUserAudience(selectedUserEmail, campaignId);
        if(res.success) {
            setSelectedUserCampaigns(prev => prev.filter(c => c._id !== campaignId));
            getUserData(); 
            toast.success("Campaign removed successfully");
        }
    } catch (error) {
        console.error("Failed to remove campaign", error);
        toast.error("Failed to remove campaign");
    }
  };



  return (
    <div className="container my-5">
      <ToastContainer />
      <h2 className="mb-4">Users</h2>
      <div className="table-responsive">
        <table className="table table-hover align-middle shadow-sm rounded">
          <thead className="table-primary">
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Role</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="d-flex align-items-center">
                      <div
                        className="bg-primary text-white rounded-circle me-2 d-flex align-items-center justify-content-center"
                        style={{ width: "30px", height: "30px" }}
                      >
                        <User size={16} />
                      </div>
                      {user._id}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge bg-secondary">{user.role}</span>
                  </td>
                  <td className="text-end d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-outline-info"
                      onClick={() => handleShowCampaigns(user)}
                    >
                      <Layers size={16} /> Campaigns
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(user._id,user)}
                    >
                      <Pencil size={16} /> Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(user._id)}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      <EditUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
        onSave={handleSave}
      />

      {/* Campaigns Modal */}
      {showCampaignModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="bg-white rounded shadow p-4" style={{ width: '90%', maxWidth: '800px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="m-0">User Campaigns</h4>
              <button className="btn btn-link text-dark p-0" onClick={() => setShowCampaignModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Campaign Name</th>
                    <th>Advertiser ID</th>
                    <th>Token</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedUserCampaigns.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center text-muted">
                        No campaigns assigned to this user.
                      </td>
                    </tr>
                  ) : (
                    selectedUserCampaigns.map((camp) => (
                      <tr key={camp._id}>
                        <td>{camp.campaign_name}</td>
                        <td>{camp.advertiseId}</td>
                        <td className="text-truncate" style={{ maxWidth: "150px" }} title={camp.token}>
                          {camp.token ? `${camp.token.substring(0, 20)}...` : "N/A"}
                        </td>
                        <td>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleRemoveCampaign(camp._id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserPage;

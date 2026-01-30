"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, User, Plus } from "lucide-react";
import CreateAdvertiseModal from "./CreateAdvertiseModal";
import CreateCampaignModal from "./CreateAdvertiseCampaign";
import { useRouter } from "next/navigation";
import { getAdvertisersCampaign } from "@/services/advertiser";

function UserPage() {
  const [users, setUsers] = useState([]);
  const router = useRouter();

  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);

  const getUserData = async () => {
    const res = await getAdvertisersCampaign();
    console.log("res", res);
    if (res.results) {
      setUsers(res.data.advertises);
    }
  };

  useEffect(() => {
    getUserData();
  }, []);

  const handleEdit = (id, user) => {
    router.push(`/users?id=${id}`);
    setEditingUser(user);
    setShowModal(true);
  };

  const handleSave = (_id, updatedData) => {
    setUsers((prev) =>
      prev.map((u) => (u._id === _id ? { ...u, ...updatedData } : u))
    );
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    const res = await deleteUser(id);
    if (res.message) {
      getUserData();
    }
  };

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Advertisers</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={18} />
            Create Advertise
          </button>
          <button
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={() => setShowCreateCampaignModal(true)}
          >
            <Plus size={18} />
            Create Campaign
          </button>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-hover align-middle shadow-sm rounded">
          <thead className="table-primary">
            <tr>
              <th>AdvertiseId</th>
              <th>AdvertiseName</th>
              <th>CampaignId</th>
              <th>CampaignName</th>

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
                      {user.advertise_id.advertise_id}
                    </div>
                  </td>
                  <td>{user.advertise_id.advertiser_name}</td>
                  <td>
                    <span className="badge bg-secondary">
                      {user.campaign_id}
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-secondary">
                      {user.campaign_name}
                    </span>
                  </td>
                  <td className="text-end d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-sm btn-outline-warning"
                      onClick={() => handleEdit(user._id, user)}
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

      {/* Create Advertise Modal */}
      <CreateAdvertiseModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={getUserData}
      />

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        show={showCreateCampaignModal}
        onClose={() => setShowCreateCampaignModal(false)}
        onSuccess={getUserData}
      />

      {/* <EditUserModal
        show={showModal}
        onClose={() => setShowModal(false)}
        user={editingUser}
        onSave={handleSave}
      /> */}
    </div>
  );
}

export default UserPage;

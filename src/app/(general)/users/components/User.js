"use client";
import React, { useEffect, useState } from "react";
import { Pencil, Trash2, User } from "lucide-react";
import EditUserModal from "./EditUserModal";
import { useRouter } from "next/navigation";
import { deleteUser, getAllUsers } from "@/services/users";

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
  };

  const handleDelete =async (id) => {
    const res=await deleteUser(id)
    if (res.message){
      getUserData()
    }

  };



  return (
    <div className="container my-5">
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
    </div>
  );
}

export default UserPage;

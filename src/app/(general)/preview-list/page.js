"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ItemTable from "./components/ItemTable";
import ItemModal from "./components/ItmeModal";
import { useSession } from "next-auth/react";
import { getAudience } from "@/services/createaudience";

const ItemManager = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null,
    previewUrl: "",
    logo: null,
  });
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      if (session?.user?.role === "super_admin") {
        try {
          const res = await getAudience();
          if (res?.data) {
            setItems(res.data.map(aud => ({
              id: aud._id,
              name: aud.reportName,
              description: `Advertiser: ${aud.advertiserId} | CPM: ${aud.cpm}`,
              previewUrl: `/preview?advertiser=${aud.advertiserId}`,
              source: aud.source,
              logo: null
            })));
          }
        } catch (error) {
          console.error("Failed to fetch audiences", error);
        }
      } else if (session?.user?.audienceId) {
        let audData = session.user.audienceId;
        
        // If IDs only, fetch details
        if (audData.length > 0 && typeof audData[0] === 'string') {
           try {
             const res = await getAudience();
             if (res?.data) {
               audData = res.data.filter(a => audData.includes(a._id));
             }
           } catch (error) {
             console.error("Failed to fetch audience list for user", error);
           }
        }

        setItems(audData.map(aud => ({
          id: aud._id,
          name: aud.reportName,
          description: `Advertiser: ${aud.advertiserId} | CPM: ${aud.cpm}`,
          previewUrl: `/preview?advertiser=${aud.advertiserId}`,
          source: aud.source,
          logo: null
        })));
      }
    };

    if (session) {
      fetchItems();
    }
  }, [session]);

  const resetForm = () =>
    setFormData({
      name: "",
      description: "",
      file: null,
      previewUrl: "",
      logo: null,
    });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleCreate = () => {
    const newItem = { id: Date.now(), ...formData };
    setItems((prev) => [...prev, newItem]);
    resetForm();
    setShowCreate(false);
  };

  const handleEdit = () => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === showEdit.id ? { ...item, ...formData } : item
      )
    );
    resetForm();
    setShowEdit(null);
  };

  const handleDelete = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setDeleteConfirm(null);
  };

  const removeFile = () => {
    setFormData((prev) => ({ ...prev, file: null }));
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between mb-3">
        <h4 className="mb-3">Preview Campaign</h4>
        {session?.user?.role === "super_admin" && (
          <button
            className="btn btn-primary d-flex align-items-center gap-1"
            onClick={() => setShowCreate(true)}
          >
            <Plus size={18} /> Create Item
          </button>
        )}
      </div>

      {/* Table */}
      <ItemTable
        items={items}
        setFormData={setFormData}
        setShowEdit={setShowEdit}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleDelete={handleDelete}
        isEditable={session?.user?.role === "super_admin"}
      />

      {/* Create Modal */}
      {showCreate && (
        <ItemModal
          title="Create Item"
          formData={formData}
          handleInputChange={handleInputChange}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          submitLabel="Create"
        />
      )}

      {/* Edit Modal */}
      {showEdit && (
        <ItemModal
          title="Edit Item"
          formData={formData}
          handleInputChange={handleInputChange}
          onClose={() => setShowEdit(null)}
          onSubmit={handleEdit}
          submitLabel="Update"
          removeFile={removeFile} 
        />
      )}
    </div>
  );
};

export default ItemManager;

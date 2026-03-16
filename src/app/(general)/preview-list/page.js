"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ItemTable from "./components/ItemTable";
import ItemModal from "./components/ItmeModal";
import CreativeSetSettings from "./components/CreativeSetSettings";
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
  const [view, setView] = useState("list"); // "list" or "settings"

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
              previewUrl: `/preview?advertiser=${aud.advertiserId}&audienceId=${aud._id?.$oid || aud._id}`,
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
          previewUrl: `/preview?advertiser=${aud.advertiserId}&audienceId=${aud._id?.$oid || aud._id}`,
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

  if (view === "settings") {
    return (
      <div className="container-fluid py-4">
        <div className="mb-4">
          <div 
            className="text-primary small fw-bold mb-1" 
            style={{ cursor: "pointer", fontSize: '0.8rem', letterSpacing: '0.5px' }} 
            onClick={() => setView("list")}
          >
            CREATIVE SETS
          </div>
          <h2 className="fw-bold text-dark" style={{ fontSize: '1.75rem' }}>New Creative Set</h2>
        </div>
        <CreativeSetSettings 
          onCancel={() => setView("list")}
          onSave={(data) => {
            const newItem = {
              id: Date.now(),
              name: data.title,
              description: `Format: ${data.selectedFormat} | Type: ${data.selectedSubFormat}`,
              previewUrl: `/preview?name=${encodeURIComponent(data.title)}`,
              source: "Manual",
              logo: null
            };
            setItems(prev => [newItem, ...prev]);
            setView("list");
            alert("Creative set saved successfully!");
          }}
        />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between mb-4 align-items-center">
        <div>
          <h4 className="fw-bold mb-1">Preview Campaign</h4>
          <p className="text-muted small mb-0">Manage and preview your creative sets</p>
        </div>
        {session?.user?.role === "super_admin" && (
          <button
            className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2"
            onClick={() => setView("settings")}
            style={{ backgroundColor: "#6b46c1", borderColor: "#6b46c1", borderRadius: "8px", fontWeight: "600" }}
          >
            <Plus size={18} /> Create New Set
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div className="card-body p-0">
          <ItemTable
            items={items}
            setFormData={setFormData}
            setShowEdit={setShowEdit}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
            handleDelete={handleDelete}
            isEditable={session?.user?.role === "super_admin"}
          />
        </div>
      </div>

      {/* Legacy Modals (keeping for now just in case) */}
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

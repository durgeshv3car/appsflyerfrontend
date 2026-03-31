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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [query, setQuery] = useState("");
  const limit = 10;

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/creatives?page=${page}&limit=${limit}&search=${encodeURIComponent(query)}`);
        if (response.ok) {
          const result = await response.json();
          setTotalPages(result.totalPages || 1);
          if (result.data) {
            setItems(result.data.map(creative => ({
              id: creative._id,
              name: creative.creativeName,
              description: `Type: ${creative.type}`,
              type: creative.type,
              previewUrl: creative.fileUrl,
              source: "Upload API",
              logo: null
            })));
          }
        }
      } catch (error) {
        console.error("Failed to fetch creatives:", error);
      }
    };

    fetchItems();
  }, [page, query, view]);

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

  const handleEdit = async () => {
    try {
      const data = new FormData();
      data.append("creativeName", formData.name);
      
      let cType = formData.type;
      if (!cType && formData.description) {
        cType = formData.description.replace("Type: ", "").trim();
      }
      if (cType) data.append("type", cType);

      if (formData.file) {
        data.append("file", formData.file);
      } else if (formData.previewUrl) {
        data.append("fileUrl", formData.previewUrl);
      }

      const response = await fetch(`http://localhost:5000/api/creatives/${showEdit.id}`, {
        method: "PUT",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        const updated = result.data || {};
        
        setItems((prev) =>
          prev.map((item) =>
            item.id === showEdit.id ? { 
              ...item, 
              name: updated.creativeName || formData.name,
              previewUrl: updated.fileUrl || formData.previewUrl,
              description: updated.type ? `Type: ${updated.type}` : formData.description,
              type: updated.type || cType
            } : item
          )
        );
        resetForm();
        setShowEdit(null);
      } else {
        let errMessage = "Unknown error";
        try {
          const errJSON = await response.json();
          errMessage = errJSON.error || errJSON.message || JSON.stringify(errJSON);
        } catch {
          errMessage = await response.text();
        }
        
        if (errMessage.includes("duplicate") || errMessage.includes("E11000")) {
          alert("A conflicting creative format or title already exists in the backend. Please try a different name.");
        } else {
          alert("Failed to update: " + errMessage);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Network or system error updating creative");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/creatives/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setDeleteConfirm(null);
      } else {
        let errMessage = "Unknown error";
        try {
          const errJSON = await response.json();
          errMessage = errJSON.error || errJSON.message || JSON.stringify(errJSON);
        } catch {
          errMessage = await response.text();
        }
        alert("Failed to delete: " + errMessage);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting creative");
    }
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
              id: data.responseData?.data?._id || data.responseData?.creative?._id || data.responseData?._id || Date.now(),
              name: data.title || data.responseData?.creativeName,
              description: `Type: ${data.selectedFormat}`,
              type: data.selectedFormat,
              previewUrl: data.responseData?.data?.fileUrl || data.responseData?.creative?.fileUrl || data.responseData?.fileUrl || data.fileUrl || `/preview?name=${encodeURIComponent(data.title)}`,
              source: "Upload API",
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
        <div className="d-flex align-items-center gap-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              setPage(1);
              setQuery(searchTerm);
            }} 
            className="d-flex"
          >
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="Search by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ minWidth: '220px', borderRadius: '8px 0 0 8px' }}
            />
            <button 
              type="submit" 
              className="btn btn-sm btn-light border px-3 text-muted" 
              style={{ borderRadius: '0 8px 8px 0', borderColor: '#dee2e6' }}
            >
              Search
            </button>
          </form>
          {session?.user?.role === "super_admin" && (
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
              onClick={() => setView("settings")}
              style={{ backgroundColor: "#6b46c1", borderColor: "#6b46c1", borderRadius: "8px", fontWeight: "600", fontSize: '0.9rem' }}
            >
              <Plus size={16} /> Create New Set
            </button>
          )}
        </div>
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
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
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

"use client";
import React, { useState } from "react";
import { Plus } from "lucide-react";
import ItemTable from "./components/ItemTable";
import ItemModal from "./components/ItmeModal";

const ItemManager = () => {
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
        <button
          className="btn btn-primary d-flex align-items-center gap-1"
          onClick={() => setShowCreate(true)}
        >
          <Plus size={18} /> Create Item
        </button>
      </div>

      {/* Table */}
      <ItemTable
        items={items}
        setFormData={setFormData}
        setShowEdit={setShowEdit}
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        handleDelete={handleDelete}
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
          title="Create Item"
          formData={formData}
          handleInputChange={handleInputChange}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          submitLabel="Create"
          removeFile={removeFile} 
        />
      )}
    </div>
  );
};

export default ItemManager;

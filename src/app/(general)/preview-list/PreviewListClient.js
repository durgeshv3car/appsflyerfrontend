"use client";
import React, { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import ItemTable from "./components/ItemTable";
import ItemModal from "./components/ItmeModal";
import CreativeSetSettings from "./components/CreativeSetSettings";
import { useSession } from "next-auth/react";
import { getAudience } from "@/services/createaudience";

const PreviewListClient = () => {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [audiences, setAudiences] = useState([]);
  const [selectedAudienceId, setSelectedAudienceId] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    file: null,
    previewUrl: "",
    logo: null,
    audienceId: "",
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

  // Fetch Audiences list for dropdown
  useEffect(() => {
    const fetchAudiences = async () => {
      try {
        const res = await getAudience();
        if (res && res.data) {
          setAudiences(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch audiences:", err);
      }
    };
    fetchAudiences();
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
        const audienceQuery =
          selectedAudienceId && selectedAudienceId !== "all"
            ? `&audienceId=${selectedAudienceId}`
            : "";
        const response = await fetch(
          `${API_BASE_URL}/creatives?page=${page}&limit=${limit}&search=${encodeURIComponent(query)}${audienceQuery}`
        );
        if (response.ok) {
          const result = await response.json();
          setTotalPages(result.totalPages || 1);
          if (result.data) {
            setItems(
              result.data.map((creative) => ({
                id: creative._id,
                name: creative.creativeName,
                description: `Type: ${creative.type}`,
                type: creative.type,
                previewUrl: creative.fileUrl,
                source: "Upload API",
                logo: null,
                audienceId: creative.audienceId?._id || creative.audienceId || "",
                audienceName:
                  creative.audienceId?.reportName ||
                  creative.audienceId?.advertiserId ||
                  "-",
              }))
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch creatives:", error);
      }
    };

    fetchItems();
  }, [page, query, view, selectedAudienceId]);

  const resetForm = () =>
    setFormData({
      name: "",
      description: "",
      file: null,
      previewUrl: "",
      logo: null,
      audienceId: "",
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

      if (formData.audienceId) {
        data.append("audienceId", formData.audienceId);
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/creatives/${showEdit.id}`, {
        method: "PUT",
        body: data,
      });

      if (response.ok) {
        const result = await response.json();
        const updated = result.data || {};

        const selectedAud = audiences.find(
          (a) => (a._id || a.id) === (updated.audienceId || formData.audienceId)
        );
        const audName =
          selectedAud?.reportName || selectedAud?.advertiserId || "-";

        setItems((prev) =>
          prev.map((item) =>
            item.id === showEdit.id
              ? {
                  ...item,
                  name: updated.creativeName || formData.name,
                  previewUrl: updated.fileUrl || formData.previewUrl,
                  description: updated.type
                    ? `Type: ${updated.type}`
                    : formData.description,
                  type: updated.type || cType,
                  audienceId: updated.audienceId || formData.audienceId || "",
                  audienceName: audName,
                }
              : item
          )
        );
        resetForm();
        setShowEdit(null);
      } else {
        let errMessage = "Unknown error";
        try {
          const errJSON = await response.json();
          errMessage =
            errJSON.error || errJSON.message || JSON.stringify(errJSON);
        } catch {
          errMessage = await response.text();
        }

        if (
          errMessage.includes("duplicate") ||
          errMessage.includes("E11000")
        ) {
          alert(
            "A conflicting creative format or title already exists in the backend. Please try a different name."
          );
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
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(`${API_BASE_URL}/creatives/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setDeleteConfirm(null);
      } else {
        let errMessage = "Unknown error";
        try {
          const errJSON = await response.json();
          errMessage =
            errJSON.error || errJSON.message || JSON.stringify(errJSON);
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
            style={{
              cursor: "pointer",
              fontSize: "0.8rem",
              letterSpacing: "0.5px",
            }}
            onClick={() => setView("list")}
          >
            CREATIVE SETS
          </div>
          <h2 className="fw-bold text-dark" style={{ fontSize: "1.75rem" }}>
            New Creative Set
          </h2>
        </div>
        <CreativeSetSettings
          onCancel={() => setView("list")}
          onSave={(data) => {
            const savedAudName =
              audiences.find(
                (a) =>
                  (a._id || a.id) ===
                  (data.audienceId || data.responseData?.data?.audienceId)
              )?.reportName || "-";
            const newItem = {
              id:
                data.responseData?.data?._id ||
                data.responseData?.creative?._id ||
                data.responseData?._id ||
                Date.now(),
              name: data.title || data.responseData?.creativeName,
              description: `Type: ${data.selectedFormat}`,
              type: data.selectedFormat,
              previewUrl:
                data.responseData?.data?.fileUrl ||
                data.responseData?.creative?.fileUrl ||
                data.responseData?.fileUrl ||
                data.fileUrl ||
                `/preview?name=${encodeURIComponent(data.title)}`,
              source: "Upload API",
              logo: null,
              audienceId:
                data.audienceId || data.responseData?.data?.audienceId || "",
              audienceName: savedAudName,
            };
            setItems((prev) => [newItem, ...prev]);
            setView("list");
            alert("Creative set saved successfully!");
          }}
          audiences={audiences}
          defaultAudienceId={selectedAudienceId !== "all" ? selectedAudienceId : ""}
        />
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between mb-4 align-items-center">
        <div>
          <h4 className="fw-bold mb-1">Preview Campaign</h4>
          <p className="text-muted small mb-0">
            Manage and preview your creative sets
          </p>
        </div>
        <div className="d-flex align-items-center gap-3">
          {/* Audience Filter Dropdown */}
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small fw-semibold text-nowrap">
              Audience:
            </span>
            <select
              className="form-select form-select-sm"
              value={selectedAudienceId}
              onChange={(e) => {
                setPage(1);
                setSelectedAudienceId(e.target.value);
              }}
              style={{
                minWidth: "200px",
                borderRadius: "8px",
                borderColor: "#dee2e6",
              }}
            >
              <option value="all">All Audiences</option>
              {audiences.map((aud) => (
                <option key={aud._id || aud.id} value={aud._id || aud.id}>
                  {aud.reportName || aud.advertiserId}
                </option>
              ))}
            </select>
          </div>

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
              style={{ minWidth: "220px", borderRadius: "8px 0 0 8px" }}
            />
            <button
              type="submit"
              className="btn btn-sm btn-light border px-3 text-muted"
              style={{
                borderRadius: "0 8px 8px 0",
                borderColor: "#dee2e6",
              }}
            >
              Search
            </button>
          </form>
          {session?.user?.role === "super_admin" && (
            <button
              className="btn btn-primary d-flex align-items-center gap-2 px-3 py-2"
              onClick={() => setView("settings")}
              style={{
                backgroundColor: "#6b46c1",
                borderColor: "#6b46c1",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
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

      {/* Legacy Modals */}
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
          audiences={audiences}
        />
      )}
    </div>
  );
};

export default PreviewListClient;

"use client";
import React, { useState } from "react";
import { Info, X } from "lucide-react";

const creativeFormats = [
  { id: "banner", label: "Banner", description: "Banners are a universal ad format available in various shapes and sizes, such as rectangles, squares, leaderboards, and others." },
  { id: "video", label: "Video", description: "Video ads display across various platforms as either instream (within video content) or outstream (outside video players)." },
  { id: "audio", label: "Audio", description: "Audio ads deliver audio format through online streaming platforms, podcasts, digital radios, and in-game environments." },
   { id: "rich-media", label: "Rich Media", description: "Rich media ads are interactive advertisements that provide a more engaging user experience." },

];



const getCreativeNameFromFile = (fileName) => {
  const baseName = fileName.substring(0, fileName.lastIndexOf('.')) || fileName;
  const cleanName = baseName.replace(/[_-]+/g, " ");
  return cleanName
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const CreativeSetSettings = ({ onCancel, onSave, audiences = [], defaultAudienceId = "" }) => {
  const [title, setTitle] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("banner");
  const [audienceId, setAudienceId] = useState(defaultAudienceId || "");
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [isMultiple, setIsMultiple] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    try {
      if (selectedFormat === "banner" && isMultiple) {
        const successes = [];
        const failures = [];
        
        for (const f of files) {
          const derivedTitle = getCreativeNameFromFile(f.name);
          const formData = new FormData();
          formData.append("creativeName", derivedTitle);
          formData.append("type", "banner");
          formData.append("file", f);
          if (audienceId) {
            formData.append("audienceId", audienceId);
          }
          
          try {
            const response = await fetch(`${apiBaseUrl}/upload`, {
              method: "POST",
              body: formData,
            });
            
            if (response.ok) {
              const data = await response.json().catch(() => ({}));
              successes.push({ title: derivedTitle, selectedFormat: "banner", file: f, audienceId, responseData: data });
            } else {
              let errText = "Unknown error";
              try {
                const errJSON = await response.json();
                errText = errJSON.error || errJSON.message || JSON.stringify(errJSON);
              } catch {
                errText = await response.text();
              }
              failures.push({ name: f.name, reason: errText });
            }
          } catch (err) {
            failures.push({ name: f.name, reason: err.message || "Network error" });
          }
        }
        
        if (failures.length > 0) {
          const successMsg = successes.length > 0 ? `Successfully uploaded ${successes.length} banners.\n` : "";
          const failureMsg = `Failed to upload ${failures.length} banners:\n` + 
            failures.map(fail => `- ${fail.name}: ${fail.reason}`).join("\n");
          alert(`${successMsg}${failureMsg}`);
        }
        
        if (successes.length > 0) {
          onSave(successes);
        }
      } else {
        const formData = new FormData();
        formData.append("creativeName", title);
        formData.append("type", selectedFormat);
        
        if (selectedFormat === "rich-media") {
          if (fileUrl) formData.append("fileUrl", fileUrl);
        } else {
          if (file) formData.append("file", file);
        }

        if (audienceId) {
          formData.append("audienceId", audienceId);
        }

        const response = await fetch(`${apiBaseUrl}/upload`, {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          onSave({ title, selectedFormat, file, fileUrl, audienceId, responseData: data });
        } else {
          let errText = "Unknown error";
          try {
            const errJSON = await response.json();
            errText = errJSON.error || errJSON.message || JSON.stringify(errJSON);
          } catch {
            errText = await response.text();
          }
          console.error("Upload failed:", errText);
          
          if (errText.includes("duplicate") || errText.includes("E11000")) {
            alert("A conflicting creative format or title already exists in the backend. Please try a different name.");
          } else {
            alert(`Upload failed: ${errText}`);
          }
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatChange = (formatId) => {
    setSelectedFormat(formatId);
    setFile(null);
    setFileUrl("");
    setIsMultiple(false);
    setFiles([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleMultipleFilesChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const removeMultipleFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const removeFile = () => {
    setFile(null);
  };

  const currentFormat = creativeFormats.find((f) => f.id === selectedFormat);


  return (
    <div className="bg-white rounded-3 shadow-sm p-5 m-3" style={{ border: "1px solid #f1f5f9", minHeight: '80vh' }}>
      <h4 className="mb-5 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>Creative Set Settings</h4>

      <div className="row mb-5 g-4">
        <div className="col-md-6">
          <label className="d-flex align-items-center gap-2 mb-3">
            <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem", letterSpacing: '0.3px' }}>Creative Set Title</span>
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
              <Info size={12} className="text-primary" />
            </div>
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={isMultiple && selectedFormat === "banner" ? "Automatically derived from image names" : "Enter a creative set title"}
            value={isMultiple && selectedFormat === "banner" ? "" : title}
            disabled={isMultiple && selectedFormat === "banner"}
            onChange={(e) => setTitle(e.target.value)}
            style={{ 
              padding: "12px 16px", 
              borderColor: "#e2e8f0", 
              borderRadius: '8px',
              fontSize: '0.95rem',
              backgroundColor: (isMultiple && selectedFormat === "banner") ? "#f8fafc" : "white"
            }}
          />
        </div>

        <div className="col-md-6">
          <label className="d-flex align-items-center gap-2 mb-3">
            <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem", letterSpacing: '0.3px' }}>Select Audience</span>
            <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
              <Info size={12} className="text-primary" />
            </div>
          </label>
          <select
            className="form-select"
            value={audienceId}
            onChange={(e) => setAudienceId(e.target.value)}
            style={{ 
              padding: "12px 16px", 
              borderColor: "#e2e8f0", 
              borderRadius: '8px',
              fontSize: '0.95rem'
            }}
          >
            <option value="">-- No Audience Linked --</option>
            {audiences.map((aud) => (
              <option key={aud._id || aud.id} value={aud._id || aud.id}>
                {aud.reportName || aud.advertiserId}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-top mb-5" style={{ borderColor: "#f1f5f9" }}></div>

      <div className="row g-5">
        {/* Creative Format Column */}
        <div className="col-md-5">
          <h6 className="fw-bold mb-4 text-dark" style={{ fontSize: '1rem' }}>Creative Format</h6>
          <div className="d-flex flex-column gap-3">
            {creativeFormats.map((format) => (
              <div 
                key={format.id} 
                className={`d-flex align-items-center gap-3 p-2 rounded-3 transition-all cursor-pointer ${selectedFormat === format.id ? "" : ""}`}
                onClick={() => handleFormatChange(format.id)}
              >
                <div 
                    className={`rounded-circle d-flex align-items-center justify-content-center border-2 transition-all ${selectedFormat === format.id ? 'border-primary' : 'border-light-custom'}`}
                    style={{ width: '20px', height: '20px', border: '2px solid' }}
                >
                    {selectedFormat === format.id && <div className="bg-primary rounded-circle" style={{ width: '10px', height: '10px' }}></div>}
                </div>
                <label 
                  className={`fw-semibold cursor-pointer m-0 ${selectedFormat === format.id ? "text-dark" : "text-muted opacity-75"}`}
                  style={{ fontSize: "0.95rem" }}
                >
                  {format.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Description and Sub-format Column */}
        <div className="col-md-7">
          <div className="d-flex gap-5 h-100 position-relative">
            {/* Format Description Box */}
            <div className="position-relative" style={{ width: "240px", flexShrink: 0 }}>
                <div className="p-4 rounded-3" style={{ backgroundColor: "#fdfdfd", border: "1px solid #f8fafc", boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                    <p className="text-muted m-0" style={{ fontSize: "0.85rem", lineHeight: "1.7", color: '#64748b' }}>
                        {currentFormat?.description}
                    </p>
                </div>
            </div>

            {/* Vertical Divider */}
            <div className="d-none d-lg-block" style={{ width: "1px", backgroundColor: "#f1f5f9" }}></div>

            {/* Sub Formats */}
            <div className="flex-grow-1">
              <h6 className="fw-bold mb-4 text-dark" style={{ fontSize: '1rem' }}>
                {currentFormat?.label} Format
              </h6>
              
              {selectedFormat === "banner" && (
                <div className="mb-4">
                  <label className="fw-semibold mb-2 text-dark" style={{ fontSize: "0.9rem" }}>Upload Mode</label>
                  <div className="d-flex gap-3">
                    <button
                      type="button"
                      className={`btn btn-sm px-4 py-2 fw-semibold rounded-3 transition-all ${
                        !isMultiple
                          ? "bg-primary text-white"
                          : "btn-outline-secondary border-light-custom text-muted"
                      }`}
                      onClick={() => {
                        setIsMultiple(false);
                        setFiles([]);
                        setFile(null);
                      }}
                      style={{
                        fontSize: "0.85rem",
                        border: !isMultiple ? "none" : "1px solid",
                        backgroundColor: !isMultiple ? "#6b46c1" : "white",
                        borderColor: !isMultiple ? "transparent" : "#e2e8f0"
                      }}
                    >
                      Single Banner
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm px-4 py-2 fw-semibold rounded-3 transition-all ${
                        isMultiple
                          ? "bg-primary text-white"
                          : "btn-outline-secondary border-light-custom text-muted"
                      }`}
                      onClick={() => {
                        setIsMultiple(true);
                        setFiles([]);
                        setFile(null);
                      }}
                      style={{
                        fontSize: "0.85rem",
                        border: isMultiple ? "none" : "1px solid",
                        backgroundColor: isMultiple ? "#6b46c1" : "white",
                        borderColor: isMultiple ? "transparent" : "#e2e8f0"
                      }}
                    >
                      Multiple Banners (Select Many)
                    </button>
                  </div>
                </div>
              )}

              {["banner", "video", "audio"].includes(selectedFormat) && (
                <div className="mt-4">
                  <label className="fw-semibold mb-2 text-dark" style={{ fontSize: "0.9rem" }}>
                    Upload {currentFormat?.label} File{selectedFormat === "banner" && isMultiple ? "s" : ""}
                  </label>
                  
                  {selectedFormat === "banner" && isMultiple ? (
                    <div>
                      <input
                        type="file"
                        className="form-control mb-3"
                        onChange={handleMultipleFilesChange}
                        accept="image/*"
                        multiple
                        style={{
                          padding: "10px 14px",
                          borderColor: "#e2e8f0",
                          borderRadius: "8px",
                        }}
                      />
                      
                      {files.length > 0 && (
                        <div className="d-flex flex-column gap-2" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "5px" }}>
                          {files.map((f, idx) => {
                            const derivedName = getCreativeNameFromFile(f.name);
                            return (
                              <div key={idx} className="d-flex align-items-center justify-content-between p-2 rounded-3 border bg-light-custom" style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
                                <div className="d-flex align-items-center gap-3 text-truncate">
                                  <img
                                    src={URL.createObjectURL(f)}
                                    alt="Preview"
                                    className="rounded-2"
                                    style={{ width: "40px", height: "40px", objectFit: "cover", border: "1px solid #dee2e6" }}
                                  />
                                  <div className="text-truncate">
                                    <span className="fw-semibold d-block text-truncate text-dark" style={{ fontSize: "0.85rem" }}>
                                      {derivedName}
                                    </span>
                                    <span className="text-muted small" style={{ fontSize: "0.75rem" }}>
                                      {f.name} ({ (f.size / 1024).toFixed(1) } KB)
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center border-0 rounded-circle"
                                  onClick={() => removeMultipleFile(idx)}
                                  style={{ width: "28px", height: "28px", padding: 0, backgroundColor: "#fee2e2", color: "#ef4444" }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {!file ? (
                        <input
                          type="file"
                          className="form-control"
                          onChange={handleFileChange}
                          accept={
                            selectedFormat === "banner" ? "image/*" : 
                            selectedFormat === "video" ? "video/*" : "audio/*"
                          }
                          style={{
                            padding: "10px 14px",
                            borderColor: "#e2e8f0",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <div className="d-flex flex-column gap-3 p-3 mt-2 rounded-3" style={{ border: "1px solid #e2e8f0", backgroundColor: "#f8fafc" }}>
                          {/* Local File Preview */}
                          <div className="d-flex justify-content-center bg-dark rounded-3 overflow-hidden" style={{ minHeight: '100px' }}>
                            {selectedFormat === "banner" && (
                              <img
                                src={URL.createObjectURL(file)}
                                alt="Uploaded Preview"
                                className="img-fluid"
                                style={{ maxHeight: '200px', objectFit: "contain" }}
                              />
                            )}
                            {selectedFormat === "video" && (
                              <video 
                                src={URL.createObjectURL(file)} 
                                controls 
                                className="w-100" 
                                style={{ maxHeight: '200px' }}
                              />
                            )}
                            {selectedFormat === "audio" && (
                              <div className="w-100 p-4 d-flex align-items-center justify-content-center">
                                <audio 
                                  src={URL.createObjectURL(file)} 
                                  controls 
                                  className="w-100"
                                />
                              </div>
                            )}
                          </div>
                          
                          {/* File Details */}
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="flex-grow-1 text-truncate">
                              <span className="fw-medium d-block text-truncate" style={{ fontSize: "0.9rem" }}>{file.name}</span>
                              <span className="text-muted small">{(file.size / 1024).toFixed(1)} KB</span>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1 border-0"
                              onClick={removeFile}
                              style={{ padding: "6px 12px", backgroundColor: "#fee2e2", color: "#ef4444" }}
                            >
                              <X size={14} /> Remove
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedFormat === "rich-media" && (
                <div className="mt-4">
                  <label className="fw-semibold mb-2 text-dark" style={{ fontSize: "0.9rem" }}>Rich Media URL</label>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="Enter Rich Media URL (e.g., https://example.com/interactive-ad)"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    style={{
                      padding: "12px 16px",
                      borderColor: "#e2e8f0",
                      borderRadius: "8px",
                      fontSize: "0.95rem"
                    }}
                  />
                  {fileUrl && (
                    <div className="mt-2 text-muted" style={{ fontSize: "0.8rem" }}>
                      Preview URL: <a href={fileUrl} target="_blank" rel="noopener noreferrer">{fileUrl}</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="d-flex justify-content-end gap-3 mt-5 pt-5 border-top" style={{ borderColor: "#f1f5f9" }}>
        <button 
          className="btn px-5 py-2 fw-bold transition-all" 
          onClick={onCancel}
          style={{ 
            color: "#6b46c1", 
            border: "1.5px solid #6b46c1", 
            backgroundColor: 'white',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
        >
          Cancel
        </button>
        <button 
          className="btn px-5 py-2 fw-bold transition-all text-white shadow-sm" 
          onClick={handleSave}
          disabled={
            isMultiple && selectedFormat === "banner"
              ? files.length === 0 || isLoading
              : !title || isLoading || (selectedFormat !== "rich-media" && !file) || (selectedFormat === "rich-media" && !fileUrl)
          }
          style={{ 
            backgroundColor: (
              isMultiple && selectedFormat === "banner"
                ? files.length === 0 || isLoading
                : !title || isLoading || (selectedFormat !== "rich-media" && !file) || (selectedFormat === "rich-media" && !fileUrl)
            ) ? "#f1f5f9" : "#6b46c1", 
            color: (
              isMultiple && selectedFormat === "banner"
                ? files.length === 0 || isLoading
                : !title || isLoading || (selectedFormat !== "rich-media" && !file) || (selectedFormat === "rich-media" && !fileUrl)
            ) ? "#94a3b8" : "white",
            borderColor: "transparent",
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
        >
          {isLoading ? "Saving..." : "Save creative set"}
        </button>
      </div>

      <style jsx>{`
        .transition-all { transition: all 0.2s ease-in-out; }
        .bg-primary { background-color: #6b46c1 !important; }
        .text-primary { color: #6b46c1 !important; }
        .border-primary { border-color: #6b46c1 !important; }
        .border-light-custom { border-color: #e2e8f0 !important; }
        .btn:hover:not(:disabled) { opacity: 0.9; }
        .cursor-pointer { cursor: pointer; }
      `}</style>
    </div>
  );
};

export default CreativeSetSettings;

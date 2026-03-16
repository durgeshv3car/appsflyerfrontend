"use client";
import React, { useState } from "react";
import { Info } from "lucide-react";

const creativeFormats = [
  { id: "banner", label: "Banner", description: "Banners are a universal ad format available in various shapes and sizes, such as rectangles, squares, leaderboards, and others." },
  { id: "video", label: "Video", description: "Video ads display across various platforms as either instream (within video content) or outstream (outside video players)." },
  { id: "native", label: "Native", description: "Native ads match the visual design of the app or site they live on, providing a better user experience." },
  { id: "native-video", label: "Native Video", description: "Native video ads display video incorporated within content, fitting various layouts and devices." },
  { id: "audio", label: "Audio", description: "Audio ads deliver audio format through online streaming platforms, podcasts, digital radios, and in-game environments." },
  { id: "engagement", label: "Engagement", description: "Engagement ads encourage users to interact with the ad content." },
  { id: "carousel", label: "Carousel", description: "Carousel ads allow you to show multiple images or videos in a single ad." },
];

const subFormats = {
  banner: [
    { id: "file-banner", label: "File Banner", description: "File banners are images in PNG, JPG, and GIF formats with the most inventory space available." },
    { id: "js-tag", label: "Javascript Tag", description: "JavaScript tags are banners featuring animations, transitions, and other moving elements, and serve as HTML5 ads to capture viewer attention." },
    { id: "rich-media", label: "Rich Media", description: "Rich Media ads are pre-made templates with advanced elements designed to catch attention and encourage user engagement." },
  ],
  video: [
    { id: "video-vast", label: "Video VAST", description: "Video VAST adjusts video based on player options and content to match the look and feel of the apps and sites." },
    { id: "ibv", label: "IBV", description: "IBV video ads are served within an embedded video player inside a 300x250 banner placement." },
    { id: "video-vast-uri", label: "Video Remote VAST URI", description: "A video remote VAST URI allows integration with different ad platforms through third-party tags for widespread video distribution." },
    { id: "video-vast-ibv", label: "Video VAST + IBV", description: "Video VAST and IBV video creatives created at once." },
  ],
  "native-video": [
    { id: "video-vast", label: "Video VAST", description: "Video VAST adjusts video based on player options and content to match the look and feel of the apps and sites." },
    { id: "video-vast-uri", label: "Video Remote VAST URI", description: "A video remote VAST URI allows integration with different ad platforms through third-party tags for widespread video distribution." },
  ],
  audio: [
    { id: "audio-vast", label: "Audio VAST", description: "Audio VAST delivers audio-only content in a publisher's audio player." },
    { id: "audio-vast-uri", label: "Audio Remote VAST URI", description: "Audio remote VAST URI allows integration with different ad platforms through third-party tags for widespread video distribution." },
  ],
  native: [
    { id: "native-display", label: "Native Display", description: "Native display ads feature a headline, description, and image that match the look and feel of the publisher's site." },
    { id: "native-content", label: "Native Content", description: "Native content ads are designed to look like a part of the content on a webpage or app." },
  ],
  engagement: [
    { id: "playable", label: "Playable", description: "Playable ads offer a short, interactive sample of a game or app experience before horizontal download." },
    { id: "scratch-reveal", label: "Scratch & Reveal", description: "Interactive ads that invite users to scratch the screen to reveal a hidden offer or message." },
  ],
  carousel: [
    { id: "image-carousel", label: "Image Carousel", description: "Image carousel ads allow you to showcase up to 10 images within a single ad, each with its own link." },
    { id: "video-carousel", label: "Video Carousel", description: "Video carousel ads allow you to showcase multiple videos in a single ad experience." },
  ],
};

const CreativeSetSettings = ({ onCancel, onSave }) => {
  const [title, setTitle] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("banner");
  const [selectedSubFormat, setSelectedSubFormat] = useState("");

  const handleFormatChange = (formatId) => {
    setSelectedFormat(formatId);
    setSelectedSubFormat("");
  };

  const currentFormat = creativeFormats.find((f) => f.id === selectedFormat);
  const currentSubFormats = subFormats[selectedFormat] || [];

  return (
    <div className="bg-white rounded-3 shadow-sm p-5 m-3" style={{ border: "1px solid #f1f5f9", minHeight: '80vh' }}>
      <h4 className="mb-5 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>Creative Set Settings</h4>

      <div className="mb-5">
        <label className="d-flex align-items-center gap-2 mb-3">
          <span className="fw-semibold text-muted" style={{ fontSize: "0.85rem", letterSpacing: '0.3px' }}>Creative Set Title</span>
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '18px', height: '18px' }}>
            <Info size={12} className="text-primary" />
          </div>
        </label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter a creative set title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ 
            maxWidth: "600px", 
            padding: "12px 16px", 
            borderColor: "#e2e8f0", 
            borderRadius: '8px',
            fontSize: '0.95rem'
          }}
        />
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
              
              {currentSubFormats.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {currentSubFormats.map((sub) => (
                    <div 
                      key={sub.id} 
                      className={`p-4 border rounded-3 d-flex gap-3 align-items-start transition-all cursor-pointer ${selectedSubFormat === sub.id ? 'bg-light-subtle shadow-sm' : ''}`}
                      style={{ 
                        borderColor: selectedSubFormat === sub.id ? "#6b46c1" : "#f1f5f9",
                        backgroundColor: selectedSubFormat === sub.id ? "rgba(107, 70, 193, 0.02)" : "white"
                      }}
                      onClick={() => setSelectedSubFormat(sub.id)}
                    >
                      <div 
                        className={`rounded-circle d-flex align-items-center justify-content-center border-2 transition-all mt-1 ${selectedSubFormat === sub.id ? 'border-primary' : 'border-light-custom'}`}
                        style={{ width: '18px', height: '18px', border: '2px solid', flexShrink: 0 }}
                      >
                        {selectedSubFormat === sub.id && <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>}
                      </div>
                      <div className="flex-grow-1">
                        <label className={`fw-bold d-block mb-1 cursor-pointer ${selectedSubFormat === sub.id ? 'text-dark' : 'text-muted'}`} style={{ fontSize: "0.9rem" }}>
                          {sub.label}
                        </label>
                        <p className="text-muted m-0" style={{ fontSize: "0.8rem", lineHeight: "1.5" }}>
                          {sub.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
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
          onClick={() => onSave({ title, selectedFormat, selectedSubFormat })}
          disabled={!title || !selectedSubFormat}
          style={{ 
            backgroundColor: (!title || !selectedSubFormat) ? "#f1f5f9" : "#6b46c1", 
            color: (!title || !selectedSubFormat) ? "#94a3b8" : "white",
            borderColor: "transparent",
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
        >
          Save creative set
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

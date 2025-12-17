import React, { useState } from 'react';

const ReportsFilter = ({tableData,filters, setFilters}) => {


  return (
    <div className="">
      {/* Header */}
      <div className="bg-white border-bottom">
        <div className="container-fluid py-3 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="h4 mb-0 text-dark fw-normal">Reports</h1>
            <div className="d-flex gap-3">
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 position-relative">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2z"/>
                </svg>
                Filter
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{fontSize: '10px', padding: '2px 6px'}}>
                  4
                </span>
              </button>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                  <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white border-bottom shadow-sm">
        <div className="container-fluid py-4 px-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h5 mb-0 fw-semibold text-dark">Filter</h2>
            <button className="btn btn-link text-decoration-none text-secondary p-0">
              Clear all
            </button>
          </div>

          {/* First Row */}
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label text-muted small mb-2">Advertiser</label>
              <select className="form-select" value={filters.advertiser} onChange={(e) => setFilters({...filters, advertiser: e.target.value})}>
                <option>Intellectads- Fly Dubai (USD)</option>
                <option>Other Advertiser</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small mb-2">Campaign</label>
              <select className="form-select text-muted" value={filters.campaign} onChange={(e) => setFilters({...filters, campaign: e.target.value})}>
                <option>All campaigns</option>
                <option>Campaign 1</option>
                <option>Campaign 2</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small mb-2">Country</label>
              <select className="form-select text-muted" value={filters.country} onChange={(e) => setFilters({...filters, country: e.target.value})}>
                <option>All countries</option>
                <option>Lithuania</option>
                <option>Latvia</option>
                <option>Moldova</option>
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label text-muted small mb-2">Sort</label>
              <select className="form-select" value={filters.sort} onChange={(e) => setFilters({...filters, sort: e.target.value})}>
                <option>View by date</option>
                <option>View by impressions</option>
                <option>View by clicks</option>
              </select>
            </div>
          </div>

          {/* Second Row */}
          <div className="row g-3">
            {/* <div className="col-md-3">
              <label className="form-label text-muted small mb-2">View</label>
              <select className="form-select" value={filters.view} onChange={(e) => setFilters({...filters, view: e.target.value})}>
                <option>Client view</option>
                <option>Admin view</option>
              </select>
            </div> */}
            <div className="col-md-3">
              <label className="form-label text-muted small mb-2">Dates</label>
              <div className="input-group">
                <input 
                  type="text" 
                  className="form-control" 
                  value={filters.dateRange}
                  onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                />
                <span className="input-group-text bg-white">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                  </svg>
                </span>
              </div>
            </div>
            {/* <div className="col-md-6">
              <label className="form-label text-muted small mb-2">Select widgets</label>
              <select className="form-select text-truncate" value={filters.widgets} onChange={(e) => setFilters({...filters, widgets: e.target.value})}>
                <option>Age groups, App/Site names, App/Site na...</option>
                <option>All widgets</option>
                <option>Custom selection</option>
              </select>
            </div> */}
          </div>

          {/* Update Button */}
          <div className="row mt-4">
            <div className="col-12 d-flex justify-content-end">
              <button className="btn btn-primary px-4">
                Update report
              </button>
            </div>
          </div>
        </div>
      </div>

  
      {/* Bootstrap Icons CSS - Add this to your project */}
      <style>{`
        .form-select,
        .form-control {
          font-size: 14px;
          padding: 0.5rem 0.75rem;
          border-color: #dee2e6;
        }
        
        .form-select:focus,
        .form-control:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }
        
        .form-label {
          font-weight: 500;
          font-size: 13px;
        }
        
        .btn-sm {
          font-size: 14px;
          padding: 0.375rem 0.75rem;
        }
        
        .input-group-text {
          border-left: 0;
          background-color: white;
          color: #6c757d;
        }
        
        .form-control {
          border-right: 0;
        }
        
        .bg-light {
          background-color: #f8f9fa !important;
        }
      `}</style>
    </div>
  );
};

export default ReportsFilter;
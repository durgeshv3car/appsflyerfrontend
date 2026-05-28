import React from 'react'
import CampaignTable from './components/Campaign'
import { checkPermissions } from '../checkPermissions'

async function page() {
  const isSuperAdmin = await checkPermissions();

  if (!isSuperAdmin) {
    return (
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div
              className="rounded-4 p-4 text-center"
              style={{
                background: 'linear-gradient(135deg, #fff1f1 0%, #ffe4e4 100%)',
                border: '1.5px solid #f5c6cb',
              }}
            >
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #ff4d4d, #c0392b)',
                  boxShadow: '0 4px 16px rgba(192,57,43,0.25)',
                }}
              >
                <i className="bi bi-shield-lock-fill text-white fs-4"></i>
              </div>
              <h5 className="fw-bold text-danger mb-1">Access Denied</h5>
              <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
                You do not have permission to view the <strong>Campaign</strong> page.
                This section is restricted to <strong>Super Admin</strong> only.
              </p>
              <a
                href="/"
                className="btn btn-sm btn-outline-danger px-4"
                style={{ borderRadius: '20px' }}
              >
                Go Back
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <CampaignTable />
    </>
  )
}

export default page
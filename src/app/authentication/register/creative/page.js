import RegisterForm from '@/components/authentication/RegisterForm'
import Image from 'next/image'
import React from 'react'

const page = () => {
  return (
    <main className="auth-creative-wrapper vh-100 bg-white">
      <div className="container-fluid h-100 p-0">
        <div className="row g-0 h-100">
          {/* Left: Graphic */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center bg-white" style={{ background: 'linear-gradient(135deg, #f8faff 0%, #e8efff 100%)' }}>
            <div className="p-4 text-center">
              <Image 
                width={800} 
                height={600} 
                sizes='100vw' 
                src="/images/dashboard_logo1.png" 
                alt="Video Promotion Dashboard" 
                className="img-fluid rounded-4 shadow-sm"
                priority
              />
            </div>
          </div>

          {/* Right: Register Form */}
          <div className="col-lg-6 d-flex align-items-center justify-content-center bg-light">
            <div className="auth-form-container px-4 px-sm-5 py-5 w-100" style={{ maxWidth: '480px' }}>
              <div className="text-center mb-4">
                 <div className="d-flex flex-column align-items-center justify-content-center mb-2">
                    <small className="text-secondary fw-bold" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.8, marginBottom: '2px' }}>Built by</small>
                    <Image 
                        className="mb-0" 
                        style={{ objectFit: 'contain' }} 
                        src="/images/login_logo.png" 
                        alt="AUTOMATE360" 
                        width={160} 
                        height={55} 
                    />
                 </div>
                 <h5 className="text-dark fw-bold mt-4 mb-0">Create your account</h5>
              </div>
              
              <RegisterForm path={"/authentication/login/creative"} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default page
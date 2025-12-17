"use client";

import React from "react";
import { FiLogOut, FiChevronDown } from "react-icons/fi";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

const ProfileModal = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  let userDetails = {
    email: "",
    name: "",
    userId: "",
  };
  console.log(session)

  if (session?.user?.token) {
    const decoded = jwtDecode(session?.user?.token);
    userDetails = {
      email: decoded.email,
      name: decoded.name,
      userId: decoded.id,
    };
  }



  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/");
  };

  return (
    <div className="dropdown nxl-h-item">
      <button
        className="d-flex align-items-center btn btn-link text-decoration-none"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <span className="me-2 fw-medium">{userDetails.name}</span>
        <FiChevronDown />
      </button>
      <div className="dropdown-menu dropdown-menu-end nxl-h-dropdown nxl-user-dropdown">
        <div className="dropdown-header">
          <div className="d-flex align-items-center">
            <div className="ms-2">
              <h6 className="text-dark mb-0">{userDetails.name}</h6>
              <span className="fs-12 fw-medium text-muted">
                {userDetails.email}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="dropdown-item d-flex align-items-center"
        >
          <FiLogOut className="me-2" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ProfileModal;

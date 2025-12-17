// src/app/(general)/checkPermissions.js
"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route"; 
import {jwtDecode} from "jwt-decode";

export const checkPermissions = async () => {
  const session = await getServerSession(authOptions);

  if (!session?.user?.token) return false;


  const decoded = jwtDecode(session.user.token);
  return decoded.role === "super_admin";
};

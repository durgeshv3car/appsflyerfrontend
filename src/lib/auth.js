"use client";

import { signIn, signOut } from "next-auth/react";

export const loginUser = async ({ email, password }) => {
  try {
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    return res ;
  } catch (error) {
    console.error("Login error:", error);
    return {
      error: error?.message || "Login failed",
      status: 500,
      ok: false,
    };
  }
};

/**
 * Logout user
 */
export const logoutUser = async () => {
  try {
    await signOut({ redirect: true, callbackUrl: "/" });
  } catch (error) {
    console.error("Logout error:", error);
  }
};

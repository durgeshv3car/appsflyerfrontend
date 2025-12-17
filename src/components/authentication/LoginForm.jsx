"use client";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser } from "@/lib/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

const LoginForm = ({ registerPath, resetPath }) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email format")
        .required("Email or Username is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await loginUser({ email: values.email, password: values.password });
        if (res.ok) {
          toast.success(res.message || "Login successful");
          localStorage.clear()
        } else {
          toast.error(res.error || "Login failed");
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong!");
      }
    },
  });

  return (
    <>
      <ToastContainer />
      <h2 className="fs-20 fw-bolder mb-4">Login</h2>
      <h4 className="fs-13 fw-bold mb-2">Login to your account</h4>
      <p className="fs-12 fw-medium text-muted">
        Welcome back! Access your Nelel web applications and recommendations.
      </p>

      <form onSubmit={formik.handleSubmit} className="w-100 mt-4 pt-2">
        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email or Username"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-danger fs-12">{formik.errors.email}</div>
          )}
        </div>

        {/* Password */}
        <div className="mb-3 position-relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="form-control"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <span
            className="position-absolute top-50 end-3 translate-middle-y c-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
          {formik.touched.password && formik.errors.password && (
            <div className="text-danger fs-12">{formik.errors.password}</div>
          )}
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <div className="custom-control custom-checkbox">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                className="custom-control-input"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
              />
              <label
                className="custom-control-label c-pointer"
                htmlFor="rememberMe"
              >
                Remember Me
              </label>
            </div>
          </div>
          <div>
            <Link href={resetPath} className="fs-11 text-primary">
              Forget password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4">
          <button type="submit" className="btn btn-lg btn-primary w-100">
            Login
          </button>
        </div>
      </form>

      {/* Register */}
      <div className="mt-5 text-muted">
        <span>Don't have an account?</span>
        <Link href={registerPath} className="fw-bold">
          {" "}
          Create an Account
        </Link>
      </div>
    </>
  );
};

export default LoginForm;

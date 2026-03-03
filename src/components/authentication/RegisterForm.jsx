"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { registerUser } from "@/services/users";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const RegisterForm = ({ path }) => {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      role: "user",
      termsCondition: true,
    },
    validationSchema: Yup.object({
      fullName: Yup.string().required("Full name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      role: Yup.string().required("Role is required"),
      termsCondition: Yup.bool().oneOf([true], "You must accept terms"),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log(values.fullName, values.role, values.email, values.password)
      try {
        const res = await registerUser(values.fullName, values.role, values.email, values.password);
        if (res.message) {
          toast.success(res.message);
          resetForm();
        }
      } catch (error) {
        toast.error(error.message || "Something went wrong!");
      }
    },
  });

  return (
    <>
      <ToastContainer />
      <h2 className="fs-20 fw-bolder mb-4">Register for account</h2>

      <form onSubmit={formik.handleSubmit} className="w-100 mt-4 pt-2">
        {/* Full Name */}
        <div className="mb-4">
          <input
            type="text"
            name="fullName"
            className="form-control"
            placeholder="Full Name"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div className="text-danger">{formik.errors.fullName}</div>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <input
            type="email"
            name="email"
            className="form-control"
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-danger">{formik.errors.email}</div>
          )}
        </div>



        {/* Password with show/hide */}
          <div className="mb-3 position-relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="form-control pe-5"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />

          <span
            className="position-absolute top-50 translate-middle-y c-pointer"
            style={{ right: "12px" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </span>

          {formik.touched.password && formik.errors.password && (
            <div className="text-danger fs-12">{formik.errors.password}</div>
          )}
        </div>

        {/* Role Dropdown */}
        <div className="mb-4">
          <select
            name="role"
            className="form-select"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="user">User</option>
            <option value="tester">Tester</option>
          </select>
          {formik.touched.role && formik.errors.role && (
            <div className="text-danger">{formik.errors.role}</div>
          )}
        </div>

        {/* Terms */}
        <div className="mt-4">
          <div className="custom-control custom-checkbox">
            <input
              type="checkbox"
              name="termsCondition"
              id="termsCondition"
              checked={formik.values.termsCondition}
              onChange={formik.handleChange}
              className="custom-control-input"
            />
            <label
              className="custom-control-label c-pointer text-muted"
              htmlFor="termsCondition"
            >
              I agree to all the <a href="#">Terms &amp; Conditions</a> and{" "}
              <a href="#">Fees</a>.
            </label>
            {formik.touched.termsCondition && formik.errors.termsCondition && (
              <div className="text-danger">{formik.errors.termsCondition}</div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="mt-5">
          <button type="submit" className="btn btn-lg btn-primary w-100">
            Create Account
          </button>
        </div>
      </form>

      <div className="mt-5 text-muted">
        <span>Already have an account?</span>
        <Link href={path} className="fw-bold">
          {" "}
          Login
        </Link>
      </div>
    </>
  );
};

export default RegisterForm;

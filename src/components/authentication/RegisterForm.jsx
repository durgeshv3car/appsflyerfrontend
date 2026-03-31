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

      <form onSubmit={formik.handleSubmit} className="w-100 mt-2">
        {/* Full Name */}
        <div className="mb-3">
          <input
            type="text"
            name="fullName"
            className="form-control"
            style={{ height: '52px', borderRadius: '8px', fontSize: '14px' }}
            placeholder="Full Name"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.fullName && formik.errors.fullName && (
            <div className="text-danger fs-12 mt-1">{formik.errors.fullName}</div>
          )}
        </div>

        {/* Email */}
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            style={{ height: '52px', borderRadius: '8px', fontSize: '14px' }}
            placeholder="Email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="text-danger fs-12 mt-1">{formik.errors.email}</div>
          )}
        </div>

        {/* Password */}
        <div className="mb-3 position-relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="form-control"
            style={{ height: '52px', borderRadius: '8px', fontSize: '14px', paddingRight: '45px' }}
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <span
            className="position-absolute top-50 translate-middle-y c-pointer text-muted"
            style={{ right: "15px" }}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </span>
          {formik.touched.password && formik.errors.password && (
            <div className="text-danger fs-12 mt-1">{formik.errors.password}</div>
          )}
        </div>

        {/* Role Dropdown */}
        <div className="mb-3">
          <select
            name="role"
            className="form-select"
            style={{ height: '52px', borderRadius: '8px', fontSize: '14px' }}
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="user">User</option>
            <option value="tester">Tester</option>
          </select>
          {formik.touched.role && formik.errors.role && (
            <div className="text-danger fs-12 mt-1">{formik.errors.role}</div>
          )}
        </div>

        {/* Terms */}
        <div className="form-check mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            id="termsCondition"
            name="termsCondition"
            checked={formik.values.termsCondition}
            onChange={formik.handleChange}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label className="form-check-label ms-1 text-muted" htmlFor="termsCondition" style={{ fontSize: '13px', cursor: 'pointer' }}>
            I agree to the <Link href="#" className="text-primary">Terms & Conditions</Link>
          </label>
          {formik.touched.termsCondition && formik.errors.termsCondition && (
            <div className="text-danger fs-12 mt-1">{formik.errors.termsCondition}</div>
          )}
        </div>

        {/* Submit */}
        <div className="mt-4">
          <button type="submit" className="btn btn-primary w-100 fw-bold" style={{ height: '52px', borderRadius: '8px', fontSize: '15px' }}>
            CREATE ACCOUNT
          </button>
        </div>

        <div className="mt-4 text-center">
            <p className="text-muted" style={{ fontSize: '14px' }}>
                Already have an account? <Link href={path} className="text-primary fw-bold">Sign in</Link>
            </p>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;

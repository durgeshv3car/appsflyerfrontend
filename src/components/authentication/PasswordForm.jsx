"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { resetPassword } from "@/services/users";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const PasswordForm = ({ token,path }) => {
  const [showPassword, setShowPassword]= useState(false);
  console.log("Token from URL:", token);

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
      termsCondition: true,
    },
    validationSchema: Yup.object({
       password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),

      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),

      termsCondition: Yup.bool().oneOf([true], "You must accept terms"),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log(values.fullName, values.role, values.email, values.password,values.confirmPassword)
      try {
        const res = await resetPassword(token,values.password,values.confirmPassword);
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
      <h2 className="fs-20 fw-bolder mb-4">Reset Password</h2>

      <form onSubmit={formik.handleSubmit} className="w-100 mt-4 pt-2">
 
     



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

          <div className="mb-3 position-relative">
          <input
           type={showPassword ? "text" : "password"}
            name="confirmPassword"
            className="form-control"
            placeholder="Confirm Password"
            value={formik.values.confirmPassword}
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

          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <div className="text-danger fs-12">{formik.errors.confirmPassword}</div>
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
            Reset Password
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

export default PasswordForm;

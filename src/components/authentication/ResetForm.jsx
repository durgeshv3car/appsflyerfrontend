"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { forgotPassword, registerUser } from "@/services/users";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ResetForm = ({ path }) => {

  const formik = useFormik({
    initialValues: {
      email: "",
      termsCondition: true,
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      termsCondition: Yup.bool().oneOf([true], "You must accept terms"),
    }),
    onSubmit: async (values, { resetForm }) => {
      console.log(values.email)
      try {
        const res = await forgotPassword(values.email);
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
      <h2 className="fs-20 fw-bolder mb-4">Change Password</h2>

      <form onSubmit={formik.handleSubmit} className="w-100 mt-4 pt-2">


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
            Change Password
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

export default ResetForm;

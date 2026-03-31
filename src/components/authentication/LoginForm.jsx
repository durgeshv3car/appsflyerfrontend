"use client";

import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser } from "@/lib/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useRouter } from "next/navigation";

const LoginForm = ({ registerPath, resetPath }) => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
        const res = await loginUser({
          email: values.email,
          password: values.password,
        });
        if (res.ok) {
          toast.success(res.message || "Login successful");
          router.push("/preview");
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

      <form onSubmit={formik.handleSubmit} className="w-100 mt-2">
        {/* Email */}
        <div className="mb-3">
          <input
            type="email"
            name="email"
            className="form-control"
            style={{ height: '54px', borderRadius: '8px', fontSize: '15px', padding: '10px 20px' }}
            placeholder="Email or Username"
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
            style={{ height: '54px', borderRadius: '8px', fontSize: '15px', padding: '10px 50px 10px 20px' }}
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
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </span>

          {formik.touched.password && formik.errors.password && (
            <div className="text-danger fs-12 mt-1">{formik.errors.password}</div>
          )}
        </div>

        {/* Remember Me + Forgot Password */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="rememberMe"
              name="rememberMe"
              checked={formik.values.rememberMe}
              onChange={formik.handleChange}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label className="form-check-label ms-1 text-muted" htmlFor="rememberMe" style={{ fontSize: '14px', cursor: 'pointer' }}>
              Remember Me
            </label>
          </div>
          <div>
            <Link href={resetPath} className="text-primary hover-underline" style={{ fontSize: '13px', fontWeight: '500' }}>
              Forget password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <div className="mt-4">
          <button 
                type="submit" 
                className="btn btn-primary w-100 fw-bold"
                style={{ height: '54px', borderRadius: '8px', fontSize: '16px', letterSpacing: '1px' }}
          >
            LOGIN
          </button>
        </div>
        
        <div className="mt-4 text-center">
            <p className="text-muted" style={{ fontSize: '14px' }}>
                Don't have an account? <Link href={registerPath} className="text-primary fw-bold">Sign up</Link>
            </p>
        </div>
      </form>

    </>
  );
};

export default LoginForm;

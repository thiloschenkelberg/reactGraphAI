import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";

import client from "../client";

interface RegisterFormValues {
  username: string;
  email: string;
  password: string;
}

export default function RegisterContainer() {
  const [message, setMessage] = useState("");
  const registerMutation = useMutation(register, {
    onSuccess: () => {
      toast.success('User created successfully!')
    }
  });

  const validationSchema = Yup.object().shape({
    username: Yup.string()
      .test(
        "len",
        "The username must be between 3 and 20 characters.",
        (val: any) =>
          val && val.toString().length >= 3 && val.toString().length <= 20
      )
      .required("This field is required!"),
    email: Yup.string()
      .email("This is not a valid email.")
      .required("This field is required!"),
    password: Yup.string()
      .test(
        "len",
        "The password must be between 6 and 40 characters.",
        (val: any) =>
          val && val.toString().length >= 6 && val.toString().length <= 40
      )
      .required("This field is required!"),
  });

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      username: "",
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (formValues) => {
      registerMutation.mutate(formValues);
    },
  });

  async function register(credentials: RegisterFormValues) {
    try {
      const response = await client.register(
        credentials.username,
        credentials.email,
        credentials.password
      );
      setMessage(response.data.message);
      console.log('im here')
    } catch (error: any) {
      setMessage(
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
          error.message ||
          error.toString()
      );
      throw new Error("Registration failed");
    }
  }

  return (
    <div>
      {!registerMutation.isSuccess && (
        <div>
        <form
        className="form"
        id="b-form"
        method=""
        action=""
        onSubmit={formik.handleSubmit}
      >
          <h2 className="form_title title">Create Account</h2>
          <input
            id="username"
            type="text"
            className="form__input"
            placeholder="username"
            {...formik.getFieldProps("username")}
          />
          {formik.touched.username && formik.errors.username && (
            <div className="alert alert-danger">{formik.errors.username}</div>
          )}

          <input
            id="email"
            type="email"
            className="form__input"
            placeholder="email"
            {...formik.getFieldProps("email")}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="alert alert-danger">{formik.errors.email}</div>
          )}

          <input
            id="password"
            type="password"
            className="form__input"
            placeholder="password"
            {...formik.getFieldProps("password")}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="alert alert-danger">{formik.errors.password}</div>
          )}

          <button
            type="submit"
            className="button submit_button"
            disabled={registerMutation.isLoading}
          >
            {registerMutation.isLoading && (
              <span className="spinner-border spinner-border-sm"></span>
            )}
            <span>Sign Up</span>
          </button>
          </form>
        </div>
      )}

      {message && (
        <div className="form-group">
          <div
            className={`alert ${
              registerMutation.isSuccess ? "alert-success" : "alert-danger"
            }`}
            role="alert"
          >
            {message}
          </div>
        </div>
      )}
    </div>
  );
}

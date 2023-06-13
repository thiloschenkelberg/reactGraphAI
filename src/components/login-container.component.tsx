import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useMutation } from "react-query";
import { toast } from 'react-hot-toast';
import client from "../client";

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginContainer() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const loginMutation = useMutation("signin", signin, {
    onSuccess: () => {
      toast.success('User logged in successfully!');
      navigate('/profile');
    },
    onError: () => {
      toast.error('User could not be created.');
    }
  });

  const validationSchema = Yup.object().shape({
    username: Yup.string().required("This field is required!"),
    password: Yup.string().required("This field is required!"),
  });

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    validationSchema,
    onSubmit: (formValues) => {
      loginMutation.mutate(formValues);
    },
  });

  async function signin(credentials: LoginFormValues) {
    try {
      const response = await client.login(credentials.username, credentials.password);
      setMessage(response.data.message);
      const token = response.data.token;
      if (token) {
        document.cookie = `token=${token}`;
      }
      //return user; // Return the user object or any other relevant data
    } catch (error: any) {
      setMessage(
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
          error.message || 
          error.toString()
      );
      throw new Error("Login failed");
    }
  }

  return (
    <form 
      className="form" 
      id="a-form"
      method=""
      action="" 
      onSubmit={formik.handleSubmit}
    >
      <h2 className="form_title title">Sign in to Website</h2>
      <input
        id="username"
        name="username"
        type="text"
        className="form__input"
        placeholder="username"
        value={formik.values.username}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.username && formik.errors.username && (
        <div className="alert alert-danger">
          {formik.errors.username}
        </div>
      )}
      <input
        id="password"
        name="password"
        type="password"
        className="form__input"
        placeholder="password"
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
      />
      {formik.touched.password && formik.errors.password && (
        <div className="alert alert-danger">
          {formik.errors.password}
        </div>
      )}
      <button
        type="submit"
        className="button submit_button"
        disabled={loginMutation.isLoading}
      >
        {loginMutation.isLoading && (
          <span className="spinner-border spinner-border-sm"></span>
        )}
        <span>Sign In</span>
      </button>
      {message && (
        <div className="form-group">
          <div className="alert alert-danger" role="alert">
            {message}
          </div>
        </div>
      )}
    </form>
  );
}
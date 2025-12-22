import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import apiClient from "../api/apiClient";
import { loginSuccess, logout } from "../store/auth-slice";

export default function OAuth2RedirectHandler() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    const finish = async () => {
      if (error) {
        dispatch(logout());
        toast.error("Google login failed. Please try again.");
        navigate("/login");
        return;
      }

      if (!token) {
        dispatch(logout());
        toast.error("Missing login token.");
        navigate("/login");
        return;
      }

      // Make token available for apiClient interceptor
      localStorage.setItem("jwtToken", token);

      try {
        const response = await apiClient.get("/auth/me");
        dispatch(loginSuccess({ jwtToken: token, user: response.data }));
        toast.success("Logged in successfully!");
        navigate("/home");
      } catch (e) {
        localStorage.removeItem("jwtToken");
        dispatch(logout());
        toast.error("Could not complete login.");
        navigate("/login");
      }
    };

    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[852px] flex items-center justify-center font-primary dark:bg-darkbg">
      <div className="bg-white dark:bg-gray-700 shadow-md rounded-lg max-w-md w-full px-8 py-6">
        <h2 className="text-2xl font-semibold text-primary dark:text-light text-center">
          Completing login...
        </h2>
      </div>
    </div>
  );
}

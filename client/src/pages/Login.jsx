
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!formData.email || !formData.password) {
      setMessage("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed.");
        return;
      }

      console.log("LOGIN RESPONSE:", data);

      // ========================================
      // SAVE TOKEN
      // ========================================

      sessionStorage.setItem(
        "token",
        data.token
      );

      // ========================================
      // SAVE USER
      // ========================================

      sessionStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Location popup ke liye flag
      sessionStorage.setItem(
      "showLocationPopup",
      "true"
      );

      

      // Inform app
        
      window.dispatchEvent(
       new Event("auth-updated")
      );


      setMessage("✅ Login successful! Redirecting...");
      

      

      // Go Home

       setTimeout(() => {
        navigate("/");
      }, 500);

      

      // ========================================
      // CLEAR OLD LOCATION FLAG
      // ========================================
      // Agar kisi previous user/device ka stale
      // location flag pada ho toh remove karo.

      if (data.user?.id) {
        sessionStorage.removeItem(
          `locationSaved_${data.user.id}`
        );
      }

      // ========================================
      // INFORM APP THAT USER LOGGED IN
      // ========================================

  

      setMessage(
        "✅ Login successful! Redirecting..."
      );

      // ========================================
      // GO TO HOME
      // ========================================

     

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setMessage(
        "❌ Cannot connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-12">

      <div className="mx-auto max-w-md">

        {/* HEADER */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-3xl shadow-lg">
            🎟️
          </div>

          <h1 className="mt-5 text-3xl font-black text-slate-900">
            Welcome Back
          </h1>

          <p className="mt-2 text-slate-500">
            Login to your EventEase India account
          </p>

        </div>

        {/* FORM CARD */}

        <div className="rounded-3xl bg-white p-7 shadow-xl">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* EMAIL */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* PASSWORD */}

            <div>

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

            </div>

            {/* MESSAGE */}

            {message && (
              <div className="rounded-xl bg-indigo-50 p-4 text-sm font-bold text-indigo-700">
                {message}
              </div>
            )}

            {/* LOGIN BUTTON */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          {/* REGISTER */}

          <p className="mt-6 text-center text-sm text-slate-500">

            Don't have an account?{" "}

            <Link
              to="/register"
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}

export default Login;


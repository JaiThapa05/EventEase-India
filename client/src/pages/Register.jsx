import { Link } from "react-router-dom";
import { useState } from "react";
import API_URL from "../config/api";
function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "participant",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (
    !formData.name ||
    !formData.email ||
    !formData.phone ||
    !formData.password
  ) {
    setMessage("Please fill all the fields.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/api/auth/register`,
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
      setMessage(data.message);
      return;
    }

    setMessage("✅ Account created successfully!");

    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "participant",
    });
  } catch (error) {
    console.error(error);
    setMessage("❌ Cannot connect to server.");
  }
};

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-12">

      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-white shadow-xl md:grid-cols-2">

        {/* LEFT SIDE */}

        <div className="hidden bg-gradient-to-br from-indigo-600 to-violet-700 p-12 text-white md:flex md:flex-col md:justify-center">

          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
            🎟️
          </div>

          <h1 className="text-4xl font-black leading-tight">
            Join EventEase India
          </h1>

          <p className="mt-5 leading-7 text-indigo-100">
            Discover exciting events, connect with people and
            create unforgettable experiences across India.
          </p>

          <div className="mt-10 space-y-5">

            <div className="flex gap-4">
              <span className="text-xl">🎫</span>
              <div>
                <p className="font-bold">Discover Events</p>
                <p className="text-sm text-indigo-200">
                  Find events happening near you.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-xl">🤝</span>
              <div>
                <p className="font-bold">Connect</p>
                <p className="text-sm text-indigo-200">
                  Meet people with similar interests.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="text-xl">📅</span>
              <div>
                <p className="font-bold">Manage Events</p>
                <p className="text-sm text-indigo-200">
                  Organizers can create and manage events.
                </p>
              </div>
            </div>

          </div>

        </div>


        {/* RIGHT SIDE */}

        <div className="p-7 sm:p-10 md:p-12">

          <div className="mb-8">

            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Get Started
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Join EventEase and start exploring events.
            </p>

          </div>


          <form onSubmit={handleSubmit} className="space-y-5">

            {/* NAME */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>


            {/* EMAIL */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>


            {/* PHONE */}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Contact Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                placeholder="Create a strong password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>


            {/* ROLE */}

            <div>

              <label className="mb-3 block text-sm font-bold text-slate-700">
                I want to join as
              </label>

              <div className="grid grid-cols-2 gap-3">

                <label
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    formData.role === "participant"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200"
                  }`}
                >

                  <input
                    type="radio"
                    name="role"
                    value="participant"
                    checked={formData.role === "participant"}
                    onChange={handleChange}
                    className="mr-2"
                  />

                  <span className="text-sm font-bold text-slate-800">
                    Participant
                  </span>

                  <p className="mt-1 text-xs text-slate-500">
                    Join events
                  </p>

                </label>


                <label
                  className={`cursor-pointer rounded-xl border p-4 transition ${
                    formData.role === "organizer"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-slate-200"
                  }`}
                >

                  <input
                    type="radio"
                    name="role"
                    value="organizer"
                    checked={formData.role === "organizer"}
                    onChange={handleChange}
                    className="mr-2"
                  />

                  <span className="text-sm font-bold text-slate-800">
                    Organizer
                  </span>

                  <p className="mt-1 text-xs text-slate-500">
                    Create events
                  </p>

                </label>

              </div>

            </div>


            {/* MESSAGE */}

            {message && (
              <div className="rounded-xl bg-indigo-50 p-3 text-sm font-semibold text-indigo-700">
                {message}
              </div>
            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700"
            >
              Create Account →
            </button>

          </form>


          {/* LOGIN LINK */}

          <p className="mt-7 text-center text-sm text-slate-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </main>
  );
}

export default Register;
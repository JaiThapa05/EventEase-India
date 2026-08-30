import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // FORM STATE
  // ========================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
    location: "",
    event_date: "",
    event_time: "",
    capacity: "",
    banner: "",
    source_url: "",
    registration_url: "",
  });

  // internal = EventEase
  // external = Official Website
  const [registrationType, setRegistrationType] =
    useState("internal");

  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState("info");


  // ========================================
  // FETCH EVENT
  // ========================================

  useEffect(() => {
    fetchEvent();
  }, [id]);


  const fetchEvent = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `https://eventease-india-api.onrender.com/api/events/${id}`
      );

      const data =
        await response.json();

      console.log(
        "EDIT EVENT DATA:",
        data
      );

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to load event"
        );

        setMessageType("error");
        return;
      }


      // ========================================
      // SET FORM
      // ========================================

      setFormData({
        title:
          data.title || "",

        description:
          data.description || "",

        category:
          data.category ||
          "Technology",

        location:
          data.location || "",

        event_date:
          data.event_date
            ? String(
                data.event_date
              ).substring(0, 10)
            : "",

        event_time:
          data.event_time &&
          data.event_time !==
            "00:00:00"
            ? String(
                data.event_time
              ).substring(0, 5)
            : "",

        capacity:
          data.capacity || "",

        banner:
          data.banner || "",

        source_url:
          data.source_url || "",

        registration_url:
          data.registration_url || "",
      });


      // ========================================
      // REGISTRATION TYPE
      // ========================================

      setRegistrationType(
        data.registration_type ===
          "external"
          ? "external"
          : "internal"
      );

    } catch (error) {

      console.error(
        "FETCH EVENT ERROR:",
        error
      );

      setMessage(
        "Unable to load event."
      );

      setMessageType("error");

    } finally {

      setLoading(false);

    }
  };


  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };


  // ========================================
  // CHANGE REGISTRATION TYPE
  // ========================================

  const handleRegistrationTypeChange = (
    type
  ) => {

    setRegistrationType(type);

    setMessage("");

    // Internal registration doesn't use
    // external registration URL
    if (type === "internal") {

      setFormData((previous) => ({
        ...previous,
        registration_url: "",
      }));

    }
  };


  // ========================================
  // UPDATE EVENT
  // ========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setSaving(true);
      setMessage("");

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }


      // ========================================
      // BASIC VALIDATION
      // ========================================

      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        !formData.category ||
        !formData.location.trim() ||
        !formData.event_date ||
        !formData.capacity
      ) {

        setMessage(
          "Please fill all required fields."
        );

        setMessageType("error");
        return;
      }


      if (
        Number(formData.capacity) <= 0
      ) {

        setMessage(
          "Capacity must be greater than 0."
        );

        setMessageType("error");
        return;
      }


      // ========================================
      // EXTERNAL REGISTRATION VALIDATION
      // ========================================

      if (
        registrationType === "external"
      ) {

        if (
          !formData.registration_url.trim()
        ) {

          setMessage(
            "Please enter the official registration URL."
          );

          setMessageType("error");
          return;
        }


        try {

          const url =
            new URL(
              formData.registration_url.trim()
            );

          if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
          ) {
            throw new Error();
          }

        } catch {

          setMessage(
            "Please enter a valid registration URL."
          );

          setMessageType("error");
          return;
        }
      }


      // ========================================
      // SOURCE URL VALIDATION
      // ========================================

      if (
        formData.source_url.trim()
      ) {

        try {

          const url =
            new URL(
              formData.source_url.trim()
            );

          if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
          ) {
            throw new Error();
          }

        } catch {

          setMessage(
            "Please enter a valid source URL."
          );

          setMessageType("error");
          return;
        }
      }


      // ========================================
      // BANNER URL VALIDATION
      // ========================================

      // Local server path is also allowed:
      // /uploads/events/...
      const bannerValue =
        formData.banner.trim();

      if (
        bannerValue &&
        !bannerValue.startsWith("/")
      ) {

        try {

          const url =
            new URL(bannerValue);

          if (
            url.protocol !== "http:" &&
            url.protocol !== "https:"
          ) {
            throw new Error();
          }

        } catch {

          setMessage(
            "Please enter a valid banner URL."
          );

          setMessageType("error");
          return;
        }
      }


      // ========================================
      // PAYLOAD
      // ========================================

      const payload = {
        title:
          formData.title.trim(),

        description:
          formData.description.trim(),

        category:
          formData.category,

        location:
          formData.location.trim(),

        event_date:
          formData.event_date,

        // Backend currently requires time
        event_time:
          formData.event_time || null,

        capacity:
          Number(
            formData.capacity
          ),

        banner:
          bannerValue || null,

        source_url:
          formData.source_url.trim() ||
          null,

        registration_type:
          registrationType,

        registration_url:
          registrationType === "external"
            ? formData.registration_url.trim()
            : null,
      };


      console.log(
        "UPDATE EVENT PAYLOAD:",
        payload
      );


      // ========================================
      // API
      // ========================================

      const response =
        await fetch(
          `https://eventease-india-api.onrender.com/api/events/${id}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify(
              payload
            ),
          }
        );


      const data =
        await response.json();


      console.log(
        "UPDATE RESPONSE:",
        data
      );


      if (!response.ok) {

        setMessage(
          data.message ||
            "Failed to update event"
        );

        setMessageType("error");
        return;
      }


      setMessage(
        "✅ Event updated successfully!"
      );

      setMessageType("success");


      // ========================================
      // REDIRECT
      // ========================================

      setTimeout(() => {

        navigate(
          "/organizer-dashboard"
        );

      }, 1200);

    } catch (error) {

      console.error(
        "UPDATE EVENT ERROR:",
        error
      );

      setMessage(
        "Something went wrong. Please try again."
      );

      setMessageType("error");

    } finally {

      setSaving(false);

    }
  };


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <h2 className="mt-5 text-2xl font-bold text-indigo-600">
            Loading event...
          </h2>

        </div>

      </div>
    );
  }


  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50">


      {/* ========================================
          HEADER
      ======================================== */}

      <section className="bg-slate-950 text-white">

        <div className="mx-auto max-w-5xl px-6 py-14">

          <Link
            to="/organizer-dashboard"
            className="text-indigo-300 transition hover:text-white"
          >
            ← Back to Dashboard
          </Link>

          <p className="mt-8 text-sm font-bold uppercase tracking-widest text-indigo-400">
            Organizer Panel
          </p>

          <h1 className="mt-2 text-4xl font-black md:text-5xl">
            Edit Event
          </h1>

          <p className="mt-3 text-slate-300">
            Update your event information and registration settings.
          </p>

        </div>

      </section>


      {/* ========================================
          FORM
      ======================================== */}

      <main className="mx-auto max-w-5xl px-6 py-10">

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
        >


          {/* MESSAGE */}

          {message && (

            <div
              className={`mb-7 rounded-2xl border p-4 font-semibold ${
                messageType ===
                "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </div>

          )}


          {/* ========================================
              BASIC DETAILS
          ======================================== */}

          <div>

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Basic Information
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Event Details
            </h2>

          </div>


          {/* TITLE */}

          <div className="mt-7">

            <label className="mb-2 block text-sm font-bold text-slate-800">
              Event Title *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />

          </div>


          {/* DESCRIPTION */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-bold text-slate-800">
              Description *
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              rows="6"
              className="w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              required
            />

          </div>


          {/* CATEGORY */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-bold text-slate-800">
              Category *
            </label>

            <select
              name="category"
              value={
                formData.category
              }
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-indigo-500"
            >

              <option value="Technology">
                Technology
              </option>

              <option value="Education">
                Education
              </option>

              <option value="Business">
                Business
              </option>

              <option value="Sports">
                Sports
              </option>

              <option value="Arts & Culture">
                Arts & Culture
              </option>

              <option value="Networking">
                Networking
              </option>

            </select>

          </div>


          {/* LOCATION */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-bold text-slate-800">
              Location *
            </label>

            <input
              type="text"
              name="location"
              value={
                formData.location
              }
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500"
              placeholder="e.g. UPES Dehradun, Uttarakhand"
              required
            />

          </div>


          {/* ========================================
              DATE / TIME
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Schedule
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Date & Time
            </h2>


            <div className="mt-6 grid gap-6 md:grid-cols-2">

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Event Date *
                </label>

                <input
                  type="date"
                  name="event_date"
                  value={
                    formData.event_date
                  }
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
                  required
                />

              </div>


              {/* TIME */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-800">
                  Event Time *
                </label>

                <input
                  type="time"
                  name="event_time"
                  value={
                    formData.event_time
                  }
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
                  required
                />

              </div>

            </div>

          </div>


          {/* ========================================
              CAPACITY
          ======================================== */}

          <div className="mt-6">

            <label className="mb-2 block text-sm font-bold text-slate-800">
              Maximum Capacity *
            </label>

            <input
              type="number"
              name="capacity"
              value={
                formData.capacity
              }
              onChange={handleChange}
              min="1"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
              required
            />

          </div>


          {/* ========================================
              BANNER
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Event Image
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Banner
            </h2>


            <div className="mt-6">

              <label className="mb-2 block text-sm font-bold text-slate-800">
                Banner Image URL
              </label>

              <input
                type="text"
                name="banner"
                value={
                  formData.banner
                }
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg or /uploads/events/image.jpg"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
              />


              {/* PREVIEW */}

              {formData.banner && (

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                  <img
                    src={
                      formData.banner.startsWith(
                        "http"
                      )
                        ? formData.banner
                        : `https://eventease-india-api.onrender.com${formData.banner}`
                    }
                    alt="Event Banner"
                    className="h-64 w-full object-contain p-3"
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />

                </div>

              )}

            </div>

          </div>


          {/* ========================================
              REGISTRATION
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Registration
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Registration Method
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Choose how participants will register for this event.
            </p>


            {/* TYPE OPTIONS */}

            <div className="mt-6 grid gap-4 md:grid-cols-2">


              {/* INTERNAL */}

              <button
                type="button"
                onClick={() =>
                  handleRegistrationTypeChange(
                    "internal"
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  registrationType ===
                  "internal"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-200"
                }`}
              >

                <div className="flex items-start justify-between">

                  <div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
                      🎟️
                    </div>

                    <h3 className="mt-4 font-black text-slate-900">
                      EventEase Registration
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Participants register directly through EventEase.
                    </p>

                  </div>

                  <span
                    className={`h-5 w-5 rounded-full border-2 ${
                      registrationType ===
                      "internal"
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-slate-300"
                    }`}
                  />

                </div>

              </button>


              {/* EXTERNAL */}

              <button
                type="button"
                onClick={() =>
                  handleRegistrationTypeChange(
                    "external"
                  )
                }
                className={`rounded-2xl border p-5 text-left transition ${
                  registrationType ===
                  "external"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-100"
                    : "border-slate-200 bg-white hover:border-indigo-200"
                }`}
              >

                <div className="flex items-start justify-between">

                  <div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-2xl">
                      🌐
                    </div>

                    <h3 className="mt-4 font-black text-slate-900">
                      Official Website
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Participants complete registration on the official website.
                    </p>

                  </div>

                  <span
                    className={`h-5 w-5 rounded-full border-2 ${
                      registrationType ===
                      "external"
                        ? "border-indigo-600 bg-indigo-600"
                        : "border-slate-300"
                    }`}
                  />

                </div>

              </button>

            </div>


            {/* EXTERNAL URL */}

            {registrationType ===
              "external" && (

              <div className="mt-5 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Official Registration URL *
                </label>

                <input
                  type="url"
                  name="registration_url"
                  value={
                    formData.registration_url
                  }
                  onChange={handleChange}
                  placeholder="https://example.com/register"
                  required
                  className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Users will be sent to this official website. Their EventEase registration remains pending until it is verified.
                </p>

              </div>

            )}

          </div>


          {/* ========================================
              SOURCE
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Source
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Official Event Source
            </h2>

            <div className="mt-6">

              <label className="mb-2 block text-sm font-bold text-slate-800">
                Source URL
              </label>

              <input
                type="url"
                name="source_url"
                value={
                  formData.source_url
                }
                onChange={handleChange}
                placeholder="https://official-event-website.com"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3"
              />

            </div>

          </div>


          {/* ========================================
              ACTIONS
          ======================================== */}

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-8 sm:flex-row">

            <Link
              to="/organizer-dashboard"
              className="flex-1 rounded-xl bg-slate-100 py-4 text-center font-bold text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {saving
                ? "Updating..."
                : "💾 Update Event"}
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default EditEvent;
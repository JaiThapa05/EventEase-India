import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateEvent() {
  const navigate = useNavigate();

  // ========================================
  // FORM STATE
  // ========================================

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    event_date: "",
    event_time: "",
    capacity: "",
    banner: "",
    source_url: "",
    registration_url: "",
  });

  // ========================================
  // CUSTOM 12-HOUR TIME STATE
  // ========================================

  const [timeHour, setTimeHour] = useState("");
  const [timeMinute, setTimeMinute] = useState("");
  const [timePeriod, setTimePeriod] = useState("AM");

  // ========================================
  // REGISTRATION TYPE
  // internal = EventEase
  // external = Official Website
  // ========================================

  const [registrationType, setRegistrationType] =
    useState("internal");

  // ========================================
  // UI STATE
  // ========================================

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ========================================
  // HANDLE INPUT
  // ========================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // ========================================
  // HANDLE TIME CHANGE
  // ========================================

  const handleTimeChange = (
    hour,
    minute,
    period
  ) => {
    setTimeHour(hour);
    setTimeMinute(minute);
    setTimePeriod(period);

    setError("");
    setSuccess("");

    // Convert 12-hour time to 24-hour format
    let convertedHour = Number(hour);

    if (period === "AM") {
      if (convertedHour === 12) {
        convertedHour = 0;
      }
    } else {
      if (convertedHour !== 12) {
        convertedHour += 12;
      }
    }

    const formattedHour = String(
      convertedHour
    ).padStart(2, "0");

    const formattedMinute = String(
      minute
    ).padStart(2, "0");

    const backendTime =
      `${formattedHour}:${formattedMinute}`;

    setFormData((prev) => ({
      ...prev,
      event_time: backendTime,
    }));
  };

  // ========================================
  // CHANGE REGISTRATION TYPE
  // ========================================

  const handleRegistrationTypeChange = (
    type
  ) => {
    setRegistrationType(type);

    setError("");
    setSuccess("");

    // Internal registration doesn't need
    // an external registration URL.
    if (type === "internal") {
      setFormData((prev) => ({
        ...prev,
        registration_url: "",
      }));
    }
  };

  // ========================================
  // SUBMIT
  // ========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess("");

    // ========================================
    // LOGIN CHECK
    // ========================================

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Please login as an organizer first."
      );

      setLoading(false);
      return;
    }

    // ========================================
    // VALIDATION
    // ========================================

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category ||
      !formData.location.trim() ||
      !formData.event_date ||
      !formData.event_time ||
      !formData.capacity
    ) {
      setError(
        "Please fill all required fields."
      );

      setLoading(false);
      return;
    }

    // Make sure time is selected
    if (
      !timeHour ||
      !timeMinute ||
      !timePeriod
    ) {
      setError(
        "Please select event time."
      );

      setLoading(false);
      return;
    }

    if (
      Number(formData.capacity) <= 0
    ) {
      setError(
        "Capacity must be greater than 0."
      );

      setLoading(false);
      return;
    }

    // ========================================
    // EXTERNAL URL VALIDATION
    // ========================================

    if (
      registrationType === "external" &&
      !formData.registration_url.trim()
    ) {
      setError(
        "Please enter the official registration URL."
      );

      setLoading(false);
      return;
    }

    if (
      registrationType === "external"
    ) {
      try {
        const url = new URL(
          formData.registration_url
        );

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        setError(
          "Please enter a valid registration URL."
        );

        setLoading(false);
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
        const url = new URL(
          formData.source_url
        );

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        setError(
          "Please enter a valid source URL."
        );

        setLoading(false);
        return;
      }
    }

    // ========================================
    // BANNER URL VALIDATION
    // ========================================

    if (
      formData.banner.trim()
    ) {
      try {
        const url = new URL(
          formData.banner
        );

        if (
          url.protocol !== "http:" &&
          url.protocol !== "https:"
        ) {
          throw new Error();
        }
      } catch {
        setError(
          "Please enter a valid banner image URL."
        );

        setLoading(false);
        return;
      }
    }

    // ========================================
    // PREPARE DATA
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

      // Backend receives HH:mm
      // Example: 10:30 PM -> 22:30
      event_time:
        formData.event_time,

      capacity:
        Number(formData.capacity),

      banner:
        formData.banner.trim() ||
        null,

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

    // ========================================
    // API REQUEST
    // ========================================

    try {
      const response = await fetch(
        "https://eventease-india.onrender.com/api/events",
        {
          method: "POST",

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

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create event."
        );
      }

      console.log(
        "EVENT CREATED:",
        data
      );

      setSuccess(
        "🎉 Event created successfully!"
      );

      // ========================================
      // CLEAR FORM
      // ========================================

      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        event_date: "",
        event_time: "",
        capacity: "",
        banner: "",
        source_url: "",
        registration_url: "",
      });

      setTimeHour("");
      setTimeMinute("");
      setTimePeriod("AM");

      setRegistrationType(
        "internal"
      );

      // ========================================
      // GO TO DASHBOARD
      // ========================================

      setTimeout(() => {
        navigate(
          "/organizer-dashboard"
        );
      }, 1200);

    } catch (error) {
      console.error(
        "CREATE EVENT ERROR:",
        error
      );

      setError(
        error.message ||
          "Failed to create event."
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // CANCEL
  // ========================================

  const handleCancel = () => {
    navigate(-1);
  };

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ========================================
          HEADER
      ======================================== */}

      <section className="bg-slate-950 text-white">

        <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">

          <p className="font-bold uppercase tracking-widest text-indigo-400">
            Organizer Panel
          </p>

          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
            Create New Event
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
            Publish your event and let participants discover
            and register for it.
          </p>

        </div>

      </section>

      {/* ========================================
          FORM
      ======================================== */}

      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-6 md:p-8"
        >

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              ❌ {error}
            </div>
          )}

          {/* SUCCESS */}

          {success && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-700">
              {success}
            </div>
          )}

          {/* ========================================
              BASIC INFORMATION
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

            <label className="mb-2 block text-sm font-bold text-slate-700">
              Event Title *
            </label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter event title"
              maxLength={150}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

          </div>

          {/* DESCRIPTION */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-bold text-slate-700">
              Description *
            </label>

            <textarea
              name="description"
              value={
                formData.description
              }
              onChange={handleChange}
              placeholder="Describe your event..."
              rows="6"
              maxLength={5000}
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {formData.description.length}
              / 5000
            </p>

          </div>

          {/* CATEGORY */}

          <div className="mt-5">

            <label className="mb-2 block text-sm font-bold text-slate-700">
              Category *
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500"
            >

              <option value="">
                Select Category
              </option>

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

          {/* ========================================
              DATE & TIME
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Schedule
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              When is your event?
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">

              {/* DATE */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Event Date *
                </label>

                <input
                  type="date"
                  name="event_date"
                  value={
                    formData.event_date
                  }
                  onChange={handleChange}
                  min={
                    new Date()
                      .toISOString()
                      .split("T")[0]
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500"
                />

              </div>

              {/* CUSTOM TIME */}

              <div>

                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Event Time *
                </label>

                <div className="grid grid-cols-3 gap-3">

                  {/* HOUR */}

                  <select
                    value={timeHour}
                    onChange={(e) =>
                      handleTimeChange(
                        e.target.value,
                        timeMinute,
                        timePeriod
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    <option value="">
                      Hour
                    </option>

                    {Array.from(
                      { length: 12 },
                      (_, index) => index + 1
                    ).map((hour) => (
                      <option
                        key={hour}
                        value={hour}
                      >
                        {hour}
                      </option>
                    ))}

                  </select>

                  {/* MINUTE */}

                  <select
                    value={timeMinute}
                    onChange={(e) =>
                      handleTimeChange(
                        timeHour,
                        e.target.value,
                        timePeriod
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    <option value="">
                      Min
                    </option>

                    {Array.from(
                      { length: 12 },
                      (_, index) =>
                        index * 5
                    ).map((minute) => (
                      <option
                        key={minute}
                        value={String(
                          minute
                        ).padStart(2, "0")}
                      >
                        {String(
                          minute
                        ).padStart(2, "0")}
                      </option>
                    ))}

                  </select>

                  {/* AM / PM */}

                  <select
                    value={timePeriod}
                    onChange={(e) =>
                      handleTimeChange(
                        timeHour,
                        timeMinute,
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >

                    <option value="AM">
                      AM
                    </option>

                    <option value="PM">
                      PM
                    </option>

                  </select>

                </div>

                {/* TIME PREVIEW */}

                <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">

                  {timeHour &&
                  timeMinute ? (
                    <p className="text-sm font-bold text-indigo-700">
                      🕐 Event time:{" "}
                      {timeHour}:
                      {timeMinute}{" "}
                      {timePeriod}
                    </p>
                  ) : (
                    <p className="text-sm text-indigo-500">
                      Select hour, minute and AM/PM
                    </p>
                  )}

                </div>

              </div>

            </div>

          </div>

          {/* ========================================
              LOCATION
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Location
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Where is your event?
            </h2>

            <div className="mt-6">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Location *
              </label>

              <input
                type="text"
                name="location"
                value={
                  formData.location
                }
                onChange={handleChange}
                placeholder="e.g. UPES Dehradun, Uttarakhand"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Include city and state so users can find relevant events.
              </p>

            </div>

            {/* CAPACITY */}

            <div className="mt-5">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Capacity *
              </label>

              <input
                type="number"
                name="capacity"
                value={
                  formData.capacity
                }
                onChange={handleChange}
                min="1"
                placeholder="100"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500"
              />

            </div>

          </div>

          {/* ========================================
              BANNER
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Event Image
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Add Event Banner
            </h2>

            <div className="mt-6">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Banner Image URL
              </label>

              <input
                type="url"
                name="banner"
                value={
                  formData.banner
                }
                onChange={handleChange}
                placeholder="https://example.com/event-image.jpg"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Use a real event-related image URL.
              </p>

              {/* IMAGE PREVIEW */}

              {formData.banner && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">

                  <img
                    src={
                      formData.banner
                    }
                    alt="Event preview"
                    className="max-h-72 w-full object-contain p-3"
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
              How should participants register?
            </h2>

            {/* TYPE SELECT */}

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
                      Participants register directly on EventEase.
                    </p>

                  </div>

                  <div
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
                      Participants complete registration on the official event website.
                    </p>

                  </div>

                  <div
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
                  className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Users will be sent to this official website. EventEase will create a pending registration and only verified registrations should become visible in My Events.
                </p>

              </div>

            )}

          </div>

          {/* ========================================
              SOURCE URL
          ======================================== */}

          <div className="mt-8 border-t border-slate-100 pt-8">

            <p className="text-xs font-black uppercase tracking-widest text-indigo-600">
              Source
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Event Source
            </h2>

            <div className="mt-6">

              <label className="mb-2 block text-sm font-bold text-slate-700">
                Official Event / Source URL
              </label>

              <input
                type="url"
                name="source_url"
                value={
                  formData.source_url
                }
                onChange={handleChange}
                placeholder="https://official-event-website.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Optional. Useful for users who want official event details.
              </p>

            </div>

          </div>

          {/* ========================================
              ACTIONS
          ======================================== */}

          <div className="mt-10 flex flex-col-reverse gap-3 border-t border-slate-100 pt-8 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                handleCancel
              }
              disabled={loading}
              className="rounded-xl border border-slate-200 px-6 py-3 font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-indigo-600 px-7 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading
                ? "Creating Event..."
                : "Create Event →"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}

export default CreateEvent;
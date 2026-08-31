import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import EventCard from "../components/EventCard";
import API_URL from "../config/api";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("");

  const [searchParams] = useSearchParams();

  // ========================================
  // FORMAT EVENT DATE
  // ========================================

  const formatEventDate = (eventDate) => {
    if (!eventDate) {
      return "Date TBA";
    }

    const dateString = String(eventDate).substring(0, 10);
    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return "Date TBA";
    }

    const [year, month, day] = parts.map(Number);

    if (
      !year ||
      !month ||
      !day ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31
    ) {
      return "Date TBA";
    }

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return "Date TBA";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ========================================
  // FORMAT EVENT TIME
  // ========================================

  const formatEventTime = (eventTime) => {
    if (!eventTime) {
      return "Time TBA";
    }

    const value = String(eventTime).trim();

    if (
      value === "00:00:00" ||
      value === "00:00"
    ) {
      return "Time TBA";
    }

    const parts = value.split(":");

    if (parts.length < 2) {
      return "Time TBA";
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    if (
      Number.isNaN(hours) ||
      Number.isNaN(Number(minutes))
    ) {
      return "Time TBA";
    }

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
  };

  // ========================================
  // FETCH EVENTS
  // ========================================

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const eventsUrl = `${API_URL}/api/events`;

      console.log("================================");
      console.log("🌐 EVENTS API URL:");
      console.log(eventsUrl);
      console.log("================================");

      const response = await fetch(eventsUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-cache",
      });

      console.log("📡 EVENTS STATUS:", response.status);
      console.log(
        "📡 EVENTS CONTENT TYPE:",
        response.headers.get("content-type")
      );

      // ----------------------------------------
      // READ RESPONSE AS TEXT FIRST
      // ----------------------------------------

      const responseText = await response.text();

      console.log(
        "📦 EVENTS RESPONSE:",
        responseText.substring(0, 500)
      );

      // ----------------------------------------
      // CHECK HTTP STATUS
      // ----------------------------------------

      if (!response.ok) {
        throw new Error(
          `Events API failed: ${response.status}`
        );
      }

      // ----------------------------------------
      // CHECK JSON
      // ----------------------------------------

      const contentType =
        response.headers.get("content-type") || "";

      if (
        !contentType
          .toLowerCase()
          .includes("application/json")
      ) {
        console.error(
          "❌ API DID NOT RETURN JSON"
        );

        console.error(
          "Response:",
          responseText.substring(0, 1000)
        );

        throw new Error(
          "Events API returned HTML instead of JSON. Check API URL."
        );
      }

      // ----------------------------------------
      // PARSE JSON
      // ----------------------------------------

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error(
          "❌ JSON PARSE ERROR:",
          parseError
        );

        console.error(
          "RAW RESPONSE:",
          responseText
        );

        throw new Error(
          "Invalid JSON received from Events API."
        );
      }

      // ----------------------------------------
      // CHECK ARRAY
      // ----------------------------------------

      if (!Array.isArray(data)) {
        console.error(
          "❌ EVENTS RESPONSE IS NOT ARRAY:",
          data
        );

        throw new Error(
          "Invalid events data received from server."
        );
      }

      console.log(
        "✅ EVENTS RECEIVED:",
        data.length
      );

      // ----------------------------------------
      // SAVE EVENTS
      // ----------------------------------------

      setEvents(data);

    } catch (err) {
      console.error(
        "❌ EVENTS FETCH ERROR:",
        err
      );

      setEvents([]);

      setError(
        err.message ||
          "Unable to load events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // LOAD EVENTS
  // ========================================

  useEffect(() => {
    fetchEvents();
  }, []);

  // ========================================
  // READ CATEGORY FROM URL
  // ========================================

  useEffect(() => {
    const categoryFromURL =
      searchParams.get("category");

    setCategory(
      categoryFromURL || "All"
    );
  }, [searchParams]);

  // ========================================
  // FILTER EVENTS
  // ========================================

  const filteredEvents = events.filter((event) => {
    const searchText =
      search.toLowerCase().trim();

    const locationText =
      location.toLowerCase().trim();

    const title =
      String(event.title || "").toLowerCase();

    const description =
      String(event.description || "").toLowerCase();

    const eventLocation =
      String(event.location || "").toLowerCase();

    const eventCategory =
      String(event.category || "").trim();

    // Search
    const matchesSearch =
      !searchText ||
      title.includes(searchText) ||
      description.includes(searchText);

    // Category
    const matchesCategory =
      category === "All" ||
      eventCategory.toLowerCase() ===
        category.toLowerCase();

    // Location
    const matchesLocation =
      !locationText ||
      eventLocation.includes(locationText);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation
    );
  });

  // ========================================
  // CLEAR FILTERS
  // ========================================

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setLocation("");

    window.history.replaceState(
      {},
      "",
      "/events"
    );
  };

  // ========================================
  // PREPARE EVENTS
  // ========================================

  const formattedEvents =
    filteredEvents.map((event) => ({
      ...event,

      formatted_date:
        formatEventDate(
          event.event_date
        ),

      formatted_time:
        formatEventTime(
          event.event_time
        ),
    }));

  // ========================================
  // UI
  // ========================================

  return (
    <main className="min-h-screen bg-slate-50">

      {/* ========================================
          HEADER
      ======================================== */}

      <section className="relative overflow-hidden bg-slate-950 px-4 py-12 text-white sm:px-6 sm:py-16 lg:px-8">

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative mx-auto w-full max-w-7xl">

          <p className="text-sm font-bold uppercase tracking-widest text-indigo-400 sm:text-base">
            EVENTEASE INDIA
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            Discover Events 🎉
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
            Find technology, education, business,
            sports and cultural events happening
            across India.
          </p>

        </div>

      </section>

      {/* ========================================
          MAIN
      ======================================== */}

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        {/* ========================================
            FILTERS
        ======================================== */}

        {!loading &&
          !error &&
          events.length > 0 && (

            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-10 sm:rounded-3xl sm:p-6">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">

                {/* SEARCH */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Search Events
                  </label>

                  <input
                    type="text"
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="🔎 Search event..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-base"
                  />

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Category
                  </label>

                  <select
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-indigo-500 sm:text-base"
                  >

                    <option value="All">
                      All Categories
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

                {/* LOCATION */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Location
                  </label>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(e.target.value)
                    }
                    placeholder="📍 Search city/state..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 sm:text-base"
                  />

                </div>

              </div>

              {/* RESULT COUNT */}

              {(search ||
                location ||
                category !== "All") && (

                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-sm font-semibold text-slate-500">

                    Showing{" "}

                    <span className="font-black text-indigo-600">
                      {filteredEvents.length}
                    </span>

                    {" "}of {events.length} events

                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="w-full rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200 sm:w-auto"
                  >
                    ✕ Clear Filters
                  </button>

                </div>

              )}

            </div>

          )}

        {/* ========================================
            LOADING
        ======================================== */}

        {loading && (

          <div className="py-20 text-center sm:py-24">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

            <p className="mt-5 font-semibold text-slate-500">
              Loading events...
            </p>

          </div>

        )}

        {/* ========================================
            ERROR
        ======================================== */}

        {!loading &&
          error && (

            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center sm:rounded-3xl sm:p-10">

              <div className="text-5xl">
                ⚠️
              </div>

              <p className="mt-4 font-bold text-red-700">
                {error}
              </p>

              <button
                type="button"
                onClick={fetchEvents}
                className="mt-5 w-full rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700 sm:w-auto"
              >
                Try Again
              </button>

            </div>

          )}

        {/* ========================================
            EMPTY DATABASE
        ======================================== */}

        {!loading &&
          !error &&
          events.length === 0 && (

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm sm:rounded-3xl sm:py-20">

              <div className="text-6xl">
                📅
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-900">
                No events yet
              </h2>

              <p className="mt-2 text-slate-500">
                Be the first organizer to create an event.
              </p>

              <Link
                to="/create-event"
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
              >
                + Create Event
              </Link>

            </div>

          )}

        {/* ========================================
            NO FILTER MATCH
        ======================================== */}

        {!loading &&
          !error &&
          events.length > 0 &&
          filteredEvents.length === 0 && (

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm sm:rounded-3xl sm:py-20">

              <div className="text-6xl">
                🔍
              </div>

              <h2 className="mt-5 text-2xl font-black text-slate-900">
                No matching events
              </h2>

              <p className="mt-2 text-slate-500">
                Try changing your search or filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
              >
                Clear Filters
              </button>

            </div>

          )}

        {/* ========================================
            EVENT GRID
        ======================================== */}

        {!loading &&
          !error &&
          formattedEvents.length > 0 && (

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">

              {formattedEvents.map((event) => (

                <EventCard
                  key={event.id}
                  event={event}
                />

              ))}

            </div>

          )}

      </section>

    </main>
  );
}

export default Events;


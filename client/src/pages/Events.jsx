import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import EventCard from "../components/EventCard";

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

    const dateString = String(eventDate)
      .substring(0, 10);

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return "Date TBA";
    }

    const [year, month, day] =
      parts.map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (Number.isNaN(date.getTime())) {
      return "Date TBA";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
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
      return value;
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    if (
      Number.isNaN(hours) ||
      Number.isNaN(Number(minutes))
    ) {
      return "Time TBA";
    }

    const period =
      hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(
      2,
      "0"
    )}:${minutes} ${period}`;
  };

  // ========================================
  // FETCH EVENTS
  // ========================================

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/events"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load events"
        );
      }

      setEvents(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {
      console.error(
        "EVENTS ERROR:",
        err
      );

      setError(
        "Unable to load events."
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
  // URL CATEGORY
  // ========================================

  useEffect(() => {
    const categoryFromURL =
      searchParams.get("category");

    setCategory(
      categoryFromURL || "All"
    );
  }, [searchParams]);

  // ========================================
  // FILTER
  // ========================================

  const filteredEvents = events.filter(
    (event) => {

      const searchText =
        search.toLowerCase().trim();

      const locationText =
        location.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        event.title
          ?.toLowerCase()
          .includes(searchText) ||
        event.description
          ?.toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        event.category === category;

      const matchesLocation =
        !locationText ||
        event.location
          ?.toLowerCase()
          .includes(locationText);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation
      );
    }
  );

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
  // PREPARE EVENTS FOR CARDS
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

      <section className="relative overflow-hidden bg-slate-950 px-5 py-16 text-white">

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-violet-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">

          <p className="font-bold uppercase tracking-widest text-indigo-400">
            EVENTEASE INDIA
          </p>

          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl lg:text-6xl">
            Discover Events 🎉
          </h1>

          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
            Find technology, education, business, sports and
            cultural events happening across India.
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

            <div className="mb-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">

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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500"
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />

                </div>

              </div>

              {/* RESULT COUNT */}

              {(search ||
                location ||
                category !== "All") && (

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-5">

                  <p className="text-sm font-semibold text-slate-500">

                    Showing{" "}

                    <span className="font-black text-indigo-600">
                      {filteredEvents.length}
                    </span>

                    {" "}of {events.length} events

                  </p>

                  <button
                    onClick={clearFilters}
                    className="rounded-xl bg-slate-100 px-5 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200"
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

          <div className="py-24 text-center">

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

            <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">

              <div className="text-5xl">
                ⚠️
              </div>

              <p className="mt-4 font-bold text-red-700">
                {error}
              </p>

              <button
                onClick={fetchEvents}
                className="mt-5 rounded-xl bg-red-600 px-6 py-3 font-bold text-white hover:bg-red-700"
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

            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-20 text-center shadow-sm">

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

            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-20 text-center shadow-sm">

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

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7 xl:grid-cols-3">

              {formattedEvents.map(
                (event) => (

                  <EventCard
                    key={event.id}
                    event={event}
                  />

                )
              )}

            </div>

          )}

      </section>

    </main>
  );
}

export default Events;
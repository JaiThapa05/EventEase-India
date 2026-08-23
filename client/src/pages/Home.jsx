import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import { useEffect, useState } from "react";
import LocationSelector from "../components/LocationSelector";

function Home() {
  // ========================================
  // STATES
  // ========================================

  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  const [showLocationSelector, setShowLocationSelector] =
    useState(false);

  const [userLocation, setUserLocation] = useState({
    city: "",
    state: "",
  });


  // ========================================
  // FETCH SAVED USER LOCATION
  // ========================================

  useEffect(() => {
    const fetchUserLocation = async () => {
      const token = localStorage.getItem("token");

      // Guest user
      if (!token) {
        setUserLocation({
          city: "",
          state: "",
        });

        return;
      }

      try {
        const response = await fetch(
          "http://localhost:5000/api/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setUserLocation({
          city: data.location_city || "",
          state: data.location_state || "",
        });
      } catch (error) {
        console.error(
          "FETCH LOCATION ERROR:",
          error
        );
      }
    };

    fetchUserLocation();


    // ========================================
    // LISTEN FOR LOCATION UPDATE
    // ========================================

    const handleLocationUpdated = (event) => {
      const location = event.detail || {};

      console.log(
        "📍 LOCATION UPDATED:",
        location
      );

      setUserLocation({
        city: location.city || "",
        state: location.state || "",
      });
    };

    window.addEventListener(
      "location-updated",
      handleLocationUpdated
    );

    return () => {
      window.removeEventListener(
        "location-updated",
        handleLocationUpdated
      );
    };
  }, []);


  // ========================================
  // FETCH UPCOMING EVENTS
  // ========================================

  // ========================================
// FETCH UPCOMING EVENTS FOR USER STATE
// ========================================

useEffect(() => {
  const fetchUpcomingEvents = async () => {
    try {
      setEventsLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/events"
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load events"
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // User ki saved state
      const userState =
        userLocation.state?.trim().toLowerCase() || "";

      const futureEvents = data
        .filter((event) => {
          // Date required
          if (!event.event_date) {
            return false;
          }

          // Dehradun Tech Fest hide
          if (
            event.title
              ?.trim()
              .toLowerCase() ===
            "dehradun tech fest 2026"
          ) {
            return false;
          }

          // Date check
          const dateString = String(
            event.event_date
          ).substring(0, 10);

          const [year, month, day] =
            dateString
              .split("-")
              .map(Number);

          const eventDate = new Date(
            year,
            month - 1,
            day
          );

          if (eventDate < today) {
            return false;
          }

          // ========================================
          // LOCATION FILTER
          // ========================================

          // User location available hai
          if (userState) {
            const eventLocation =
              event.location
                ?.trim()
                .toLowerCase() || "";

            // State name event.location me hai
            // Example:
            // "Dehradun, Uttarakhand"
            // "Nainital, Uttarakhand"

            if (
              !eventLocation.includes(userState)
            ) {
              return false;
            }
          }

          return true;
        })
        .sort((a, b) => {
          const dateA = String(
            a.event_date
          ).substring(0, 10);

          const dateB = String(
            b.event_date
          ).substring(0, 10);

          return dateA.localeCompare(dateB);
        })
        .slice(0, 5);

      setUpcomingEvents(
        futureEvents
      );

    } catch (error) {

      console.error(
        "UPCOMING EVENTS ERROR:",
        error
      );

      setUpcomingEvents([]);

    } finally {

      setEventsLoading(false);

    }
  };

  fetchUpcomingEvents();

}, [userLocation.state]);


  // ========================================
  // LOCATION DISPLAY
  // ========================================

  const locationText =
    userLocation.city &&
    userLocation.state
      ? `${userLocation.city}, ${userLocation.state}`
      : userLocation.state
      ? userLocation.state
      : userLocation.city
      ? userLocation.city
      : "All India";


  // ========================================
  // RENDER
  // ========================================

  return (
    <main className="bg-slate-50">

      {/* ========================================
          HERO
      ======================================== */}

      <section className="relative overflow-hidden bg-slate-950">

        {/* Background decoration */}

        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />

        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(white 1px, transparent 1px)",
            backgroundSize: "25px 25px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 py-24 text-center md:py-32">

          {/* Badge */}

          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-indigo-200 backdrop-blur">
            🇮🇳 Discover Events Across India
          </div>


          {/* Heading */}

          <h1 className="mx-auto mt-7 max-w-4xl text-5xl font-black tracking-tight text-white md:text-7xl">
            Find Your Next

            <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              Great Experience
            </span>
          </h1>


          {/* Description */}

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Discover technology, education, business, sports and
            cultural events happening across India.
          </p>


          {/* SEARCH BOX */}

          <div className="mx-auto mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl md:flex-row">

            {/* SEARCH */}

            <div className="flex flex-1 items-center gap-3 rounded-xl bg-slate-50 px-4">

              <span className="text-xl">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search events..."
                className="w-full bg-transparent py-3 outline-none"
              />

            </div>


            {/* LOCATION */}

            <button
              type="button"
              onClick={() =>
                setShowLocationSelector(true)
              }
              className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-1 text-left transition hover:bg-indigo-50 md:w-52"
            >

              <span className="text-xl">
                📍
              </span>

              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700">
                {locationText}
              </span>

              <span className="text-xs text-slate-400">
                ▼
              </span>

            </button>


            {/* SEARCH BUTTON */}

            <Link
              to="/events"
              className="rounded-xl bg-indigo-600 px-7 py-3.5 font-bold text-white transition hover:bg-indigo-700"
            >
              Search
            </Link>

          </div>


          {/* QUICK STATS */}

          <div className="mx-auto mt-12 flex max-w-lg justify-center gap-10 border-t border-white/10 pt-8">

            <div>
              <p className="text-2xl font-black text-white">
                100+
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Events
              </p>
            </div>


            <div>
              <p className="text-2xl font-black text-white">
                25+
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Cities
              </p>
            </div>


            <div>
              <p className="text-2xl font-black text-white">
                5K+
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Participants
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ========================================
          CATEGORIES
      ======================================== */}

      <section className="mx-auto max-w-7xl px-5 py-20">

        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
            Find events you love
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Explore events based on your interests and discover
            something exciting near you.
          </p>

        </div>


        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

          {[
            ["💻", "Technology"],
            ["📚", "Education"],
            ["💼", "Business"],
            ["⚽", "Sports"],
            ["🎨", "Arts & Culture"],
            ["🤝", "Networking"],
          ].map(([icon, category]) => (

            <Link
              to={`/events?category=${encodeURIComponent(category)}`}
              key={category}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg"
            >

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl transition group-hover:bg-indigo-100">
                {icon}
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                {category}
              </h3>

            </Link>

          ))}

        </div>

      </section>


      {/* ========================================
          UPCOMING EVENTS
      ======================================== */}

      <section className="border-y border-slate-200 bg-white py-20">

        <div className="mx-auto max-w-7xl px-5">

          <div className="flex items-end justify-between">

            <div>

              <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                Don't miss out
              </p>

              <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
                Upcoming Events
              </h2>

            </div>

            <Link
              to="/events"
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              View all →
            </Link>

          </div>


          {/* EVENT CARDS */}

          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {eventsLoading ? (

              <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">
                <p className="font-semibold text-slate-500">
                  Loading upcoming events...
                </p>
              </div>

            ) : upcomingEvents.length === 0 ? (

              <div className="col-span-full rounded-2xl border border-slate-200 bg-slate-50 p-10 text-center">

                <div className="text-4xl">
                  📅
                </div>

                <p className="mt-3 font-bold text-slate-700">
                  No upcoming events
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Check back soon for new events.
                </p>

              </div>

            ) : (

              upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))

            )}

          </div>

        </div>

      </section>


      {/* ========================================
          WHY EVENTEASE
      ======================================== */}

      <section className="mx-auto max-w-7xl px-5 py-20">

        <div className="text-center">

          <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
            Why EventEase?
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900 md:text-4xl">
            Everything you need for events
          </h2>

        </div>


        <div className="mt-12 grid gap-6 md:grid-cols-3">

          {/* Feature 1 */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
              🔎
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              Discover
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Find interesting events happening in your city
              or anywhere across India.
            </p>

          </div>


          {/* Feature 2 */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
              🎟️
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              Register
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Register for events easily and keep track of
              everything you have joined.
            </p>

          </div>


          {/* Feature 3 */}

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-2xl">
              📅
            </div>

            <h3 className="mt-5 text-xl font-black text-slate-900">
              Stay Updated
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Never miss important event updates, schedules
              and reminders.
            </p>

          </div>

        </div>

      </section>


      {/* ========================================
          ORGANIZER CTA
      ======================================== */}

      <section className="px-5 pb-20">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-16 text-center">

          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(white 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative">

            <p className="text-sm font-bold uppercase tracking-widest text-indigo-200">
              For organizers
            </p>

            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">
              Have an event to organize?
            </h2>

            <p className="mx-auto mt-4 max-w-xl leading-7 text-indigo-100">
              Create your event, reach participants and manage
              registrations from one place.
            </p>

            <Link
              to="/register"
              className="mt-7 inline-block rounded-xl bg-white px-7 py-3.5 font-bold text-indigo-600 shadow-lg transition hover:-translate-y-1"
            >
              Create Your Event →
            </Link>

          </div>

        </div>

      </section>


      {/* ========================================
          LOCATION SELECTOR
      ======================================== */}

      {showLocationSelector && (
        <LocationSelector
          currentLocation={userLocation}
          onClose={() =>
            setShowLocationSelector(false)
          }
          onLocationUpdated={(location) => {
            setUserLocation({
              city: location.city || "",
              state: location.state || "",
            });
          }}
        />
      )}

    </main>
  );
}

export default Home;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");


  // ========================================
  // FETCH MY EVENTS
  // ========================================

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setMessage("");

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      const response = await fetch(
        "https://eventease-india-api.onrender.com/api/events/my-events",
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Failed to load events"
        );
        return;
      }

      if (!Array.isArray(data)) {
        setMessage(
          "Invalid events data received."
        );
        return;
      }

      setEvents(data);

    } catch (error) {

      console.error(
        "MY EVENTS ERROR:",
        error
      );

      setMessage(
        "Unable to load events."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchMyEvents();
  }, []);


  // ========================================
  // DELETE
  // ========================================

  const deleteEvent = async (
    eventId
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this event?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      const token =
        sessionStorage.getItem("token");

      const response =
        await fetch(
          `https://eventease-india-api.onrender.com/api/events/${eventId}`,
          {
            method: "DELETE",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        alert(
          data.message ||
            "Delete failed"
        );
        return;
      }

      alert(
        "Event deleted successfully!"
      );

      fetchMyEvents();

    } catch (error) {

      console.error(
        "DELETE ERROR:",
        error
      );

      alert(
        "Something went wrong."
      );
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

          <p className="mt-5 font-bold text-slate-600">
            Loading dashboard...
          </p>

        </div>

      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <section className="bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-6 py-14">

          <p className="font-bold uppercase tracking-widest text-indigo-400">
            Organizer Panel
          </p>

          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>

              <h1 className="text-4xl font-black md:text-5xl">
                Organizer Dashboard
              </h1>

              <p className="mt-3 text-slate-300">
                Manage your events, registrations and participants.
              </p>

            </div>

            <Link
              to="/create-event"
              className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              + Create Event
            </Link>

          </div>

        </div>

      </section>


      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* STATS */}

        <div className="grid gap-6 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Total Events
            </p>

            <p className="mt-2 text-4xl font-black text-indigo-600">
              {events.length}
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Status
            </p>

            <p className="mt-2 text-2xl font-black text-green-600">
              Active
            </p>

          </div>


          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Participants
            </p>

            <p className="mt-2 text-4xl font-black text-violet-600">
              {events.reduce(
                (total, event) =>
                  total +
                  Number(
                    event.registered_count ||
                      0
                  ),
                0
              )}
            </p>

          </div>

        </div>


        {/* MESSAGE */}

        {message && (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {message}
          </div>
        )}


        {/* TITLE */}

        <div className="mt-10 flex items-center justify-between">

          <div>

            <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
              Your events
            </p>

            <h2 className="mt-1 text-3xl font-black text-slate-900">
              My Events
            </h2>

          </div>

        </div>


        {/* NO EVENTS */}

        {events.length === 0 ? (

          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

            <div className="text-6xl">
              🎪
            </div>

            <h2 className="mt-5 text-2xl font-black text-slate-900">
              No events yet
            </h2>

            <p className="mt-2 text-slate-500">
              Create your first event.
            </p>

            <Link
              to="/create-event"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white hover:bg-indigo-700"
            >
              Create Event
            </Link>

          </div>

        ) : (

          <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">

            {events.map(
              (event) => {

                const imageUrl =
                  event.banner
                    ? event.banner.startsWith(
                        "http"
                      )
                      ? event.banner
                      : `https://eventease-india-api.onrender.com${event.banner}`
                    : "";

                return (
                  <article
                    key={event.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                  >

                    {/* IMAGE */}

                    <div className="relative h-52 overflow-hidden bg-gradient-to-br from-indigo-600 to-violet-600">

                      {imageUrl ? (

                        <img
                          src={imageUrl}
                          alt={event.title}
                          className="h-full w-full object-contain p-2"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center text-6xl">
                          🎉
                        </div>

                      )}

                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-indigo-600 shadow">
                        {event.category}
                      </span>

                    </div>


                    {/* CONTENT */}

                    <div className="p-6">

                      <h3 className="line-clamp-2 text-xl font-black text-slate-900">
                        {event.title}
                      </h3>

                      <div className="mt-4 space-y-2 text-sm text-slate-500">

                        <p>
                          📍 {event.location || "India"}
                        </p>

                        <p>
                          📅{" "}
                          {event.event_date
                            ? new Date(
                                String(event.event_date).substring(
                                  0,
                                  10
                                )
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "No date"}
                        </p>

                      </div>


                      {/* PARTICIPANTS */}

                      <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                        <div className="flex items-center justify-between">

                          <span className="text-sm font-semibold text-slate-500">
                            👥 Participants
                          </span>

                          <span className="font-black text-indigo-600">
                            {event.registered_count ||
                              0}{" "}
                            /{" "}
                            {event.capacity ||
                              "∞"}
                          </span>

                        </div>

                      </div>


                      {/* ACTIONS */}

                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <Link
                          to={`/events/${event.id}`}
                          className="rounded-xl bg-slate-100 py-2.5 text-center text-sm font-bold text-slate-700 hover:bg-slate-200"
                        >
                          View
                        </Link>

                        <Link
                          to={`/participants/${event.id}`}
                          className="rounded-xl bg-green-100 py-2.5 text-center text-sm font-bold text-green-700 hover:bg-green-200"
                        >
                          Participants
                        </Link>

                        <Link
                          to={`/edit-event/${event.id}`}
                          className="rounded-xl bg-indigo-100 py-2.5 text-center text-sm font-bold text-indigo-700 hover:bg-indigo-200"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() =>
                            deleteEvent(
                              event.id
                            )
                          }
                          className="rounded-xl bg-red-100 py-2.5 text-sm font-bold text-red-700 hover:bg-red-200"
                        >
                          Delete
                        </button>

                      </div>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        )}

      </main>

    </div>
  );
}

export default OrganizerDashboard;
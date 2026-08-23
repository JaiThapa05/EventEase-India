import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/registrations/my-events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load events");
        return;
      }

      setEvents(data);

    } catch (error) {
      console.error(error);
      setMessage("Unable to load your events.");
    } finally {
      setLoading(false);
    }
  };


  const cancelRegistration = async (registrationId) => {

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this registration?"
    );

    if (!confirmCancel) return;

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/registrations/${registrationId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Cancellation failed");
        return;
      }

      alert("Registration cancelled successfully!");

      fetchMyEvents();

    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-2xl font-bold text-indigo-600">
          Loading your events...
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">

          <p className="text-indigo-400 font-bold mb-3">
            YOUR ACTIVITY
          </p>

          <h1 className="text-4xl md:text-5xl font-black">
            My Events
          </h1>

          <p className="mt-4 text-slate-300">
            Manage all the events you have registered for.
          </p>

        </div>
      </section>


      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-6 py-10">

        {message && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {message}
          </div>
        )}


        {events.length === 0 && !message ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border">

            <div className="text-6xl mb-5">
              🎟️
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              No Registered Events
            </h2>

            <p className="text-slate-500 mt-3">
              You haven't registered for any events yet.
            </p>

            <Link
              to="/events"
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              Explore Events
            </Link>

          </div>
        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">

            {events.map((event) => (

              <div
                key={event.registration_id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition"
              >

                {/* Banner */}
                {event.banner ? (
                  <img
                    src={event.banner}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                    <span className="text-6xl">
                      🎉
                    </span>
                  </div>
                )}


                <div className="p-6">

                  <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                    {event.category || "Event"}
                  </span>

                  <h2 className="text-xl font-black text-slate-900 mt-4">
                    {event.title}
                  </h2>


                  <div className="mt-5 space-y-3 text-sm text-slate-600">

                    <p>
                      📅{" "}
                      {event.event_date
                        ? new Date(
                            event.event_date
                          ).toLocaleDateString("en-IN")
                        : "Date not available"}
                    </p>

                    <p>
                      ⏰ {event.event_time || "Time not available"}
                    </p>

                    <p>
                      📍 {event.location || "India"}
                    </p>

                  </div>


                  <div className="mt-6 flex gap-3">

                    <Link
                      to={`/events/${event.event_id}`}
                      className="flex-1 text-center bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold"
                    >
                      View Event
                    </Link>

                    <button
                      onClick={() =>
                        cancelRegistration(
                          event.registration_id
                        )
                      }
                      className="px-4 py-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-bold"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default MyEvents;
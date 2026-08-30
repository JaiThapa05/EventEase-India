import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function Participants() {
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchParticipants();
  }, [id]);

  const fetchParticipants = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://https://eventease-india-api.onrender.com/api/events/${id}/participants`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      console.log("PARTICIPANTS DATA:", data);

      if (!response.ok) {
        setMessage(data.message || "Failed to load participants");
        return;
      }

      setEvent(data.event);
      setParticipants(data.participants || []);

    } catch (error) {
      console.error("PARTICIPANTS ERROR:", error);
      setMessage("Unable to load participants.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <h2 className="text-2xl font-bold text-indigo-600">
          Loading participants...
        </h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <section className="bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">

          <Link
            to="/organizer-dashboard"
            className="text-indigo-300 hover:text-white"
          >
            ← Back to Dashboard
          </Link>

          <p className="text-indigo-400 font-bold mt-8">
            EVENT PARTICIPANTS
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            {event?.title || "Event Participants"}
          </h1>

          <p className="text-slate-300 mt-3">
            Manage people registered for your event.
          </p>

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ERROR */}
        {message && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {message}
          </div>
        )}

        {/* STATS */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-8">

          <p className="text-slate-500">
            Total Participants
          </p>

          <p className="text-4xl font-black text-indigo-600 mt-2">
            {participants.length}
          </p>

        </div>

        {/* NO PARTICIPANTS */}
        {participants.length === 0 ? (

          <div className="bg-white rounded-3xl border p-12 text-center">

            <div className="text-6xl mb-5">
              👥
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              No Participants Yet
            </h2>

            <p className="text-slate-500 mt-3">
              Nobody has registered for this event yet.
            </p>

          </div>

        ) : (

          /* PARTICIPANTS TABLE */
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">

            <div className="p-6 border-b">
              <h2 className="text-2xl font-black text-slate-900">
                Registered Participants
              </h2>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-slate-50">

                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-500">
                      Participant
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-500">
                      Email
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-500">
                      Phone
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-500">
                      Registered At
                    </th>

                    <th className="text-left px-6 py-4 text-sm font-bold text-slate-500">
                      Status
                    </th>
                  </tr>

                </thead>

                <tbody>

                  {participants.map((participant) => (

                    <tr
                      key={participant.registration_id}
                      className="border-t hover:bg-slate-50"
                    >

                      {/* NAME */}
                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          {participant.profile_photo ? (
                            <img
                             src={
                            participant.profile_photo
                            ? participant.profile_photo.startsWith("http")
                            ? participant.profile_photo
                            : `https://https://eventease-india-api.onrender.com${participant.profile_photo}`
                            : ""
                            }
                              alt={participant.name}
                              className="w-11 h-11 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                              {participant.name?.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-slate-900">
                              {participant.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              User ID: {participant.user_id}
                            </p>
                          </div>

                        </div>

                      </td>

                      {/* EMAIL */}
                      <td className="px-6 py-5 text-slate-600">
                        {participant.email}
                      </td>

                      {/* PHONE */}
                      <td className="px-6 py-5 text-slate-600">
                        {participant.phone || "Not provided"}
                      </td>

                      {/* REGISTERED DATE */}
                      <td className="px-6 py-5 text-slate-600">

                        {participant.registered_at
                          ? new Date(
                              participant.registered_at
                            ).toLocaleString("en-IN")
                          : "Unknown"}

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">

                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          {participant.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </main>

    </div>
  );
}

export default Participants;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load notifications");
        return;
      }

      setNotifications(data);

    } catch (error) {
      console.error("NOTIFICATION ERROR:", error);
      setMessage("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };


  // ========================================
  // MARK ONE AS READ
  // ========================================

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to update notification");
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: 1 }
            : notification
        )
      );

    } catch (error) {
      console.error(error);
    }
  };


  // ========================================
  // MARK ALL AS READ
  // ========================================

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed");
        return;
      }

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          is_read: 1,
        }))
      );

    } catch (error) {
      console.error(error);
    }
  };


  // ========================================
  // DELETE NOTIFICATION
  // ========================================

  const deleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Failed to delete");
        return;
      }

      setNotifications((prev) =>
        prev.filter(
          (notification) => notification.id !== notificationId
        )
      );

    } catch (error) {
      console.error(error);
    }
  };


  const unreadCount = notifications.filter(
    (notification) => notification.is_read === 0
  ).length;


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-indigo-600">
          Loading notifications...
        </h2>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <section className="bg-slate-950 text-white">

        <div className="max-w-5xl mx-auto px-6 py-14">

          <Link
            to="/"
            className="text-indigo-300 hover:text-white"
          >
            ← Back to Home
          </Link>

          <p className="text-indigo-400 font-bold mt-8">
            NOTIFICATIONS
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            Your Notifications 🔔
          </h1>

          <p className="text-slate-300 mt-3">
            Stay updated about your events and registrations.
          </p>

        </div>

      </section>


      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* TOP BAR */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

          <div>

            <h2 className="text-2xl font-black text-slate-900">
              Notifications
            </h2>

            <p className="text-slate-500 mt-1">
              {unreadCount} unread notification
              {unreadCount !== 1 ? "s" : ""}
            </p>

          </div>


          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold"
            >
              Mark All as Read
            </button>
          )}

        </div>


        {/* ERROR */}

        {message && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
            {message}
          </div>
        )}


        {/* EMPTY */}

        {notifications.length === 0 ? (

          <div className="bg-white rounded-3xl border shadow-sm p-14 text-center">

            <div className="text-6xl mb-5">
              🔔
            </div>

            <h2 className="text-2xl font-black text-slate-900">
              No Notifications
            </h2>

            <p className="text-slate-500 mt-2">
              You're all caught up!
            </p>

            <Link
              to="/events"
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold"
            >
              Explore Events
            </Link>

          </div>

        ) : (

          /* NOTIFICATION LIST */

          <div className="space-y-4">

            {notifications.map((notification) => (

              <div
                key={notification.id}
                className={`bg-white rounded-2xl border shadow-sm p-6 transition ${
                  notification.is_read === 0
                    ? "border-indigo-300 bg-indigo-50/30"
                    : "border-slate-200"
                }`}
              >

                <div className="flex gap-4">

                  {/* ICON */}

                  <div className="w-12 h-12 shrink-0 rounded-xl bg-indigo-100 flex items-center justify-center text-2xl">
                    {notification.type === "registration"
                      ? "🎉"
                      : notification.type === "update"
                      ? "📢"
                      : notification.type === "cancelled"
                      ? "❌"
                      : "🔔"}
                  </div>


                  {/* CONTENT */}

                  <div className="flex-1">

                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">

                      <div>

                        <p className="font-bold text-slate-900 text-lg">
                          {notification.message}
                        </p>

                        {notification.event_title && (
                          <p className="text-sm text-slate-500 mt-1">
                            Event: {notification.event_title}
                          </p>
                        )}

                      </div>


                      {notification.is_read === 0 && (
                        <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                          NEW
                        </span>
                      )}

                    </div>


                    <div className="flex flex-wrap items-center gap-3 mt-4">

                      <span className="text-sm text-slate-400">
                        🕐{" "}
                        {new Date(
                          notification.created_at
                        ).toLocaleString("en-IN")}
                      </span>


                      {notification.event_id && (
                        <Link
                          to={`/events/${notification.event_id}`}
                          className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
                        >
                          View Event
                        </Link>
                      )}

                    </div>


                    {/* ACTIONS */}

                    <div className="flex gap-3 mt-4">

                      {notification.is_read === 0 && (
                        <button
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg text-sm font-bold"
                        >
                          ✓ Mark as Read
                        </button>
                      )}

                      <button
                        onClick={() =>
                          deleteNotification(notification.id)
                        }
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-bold"
                      >
                        Delete
                      </button>

                    </div>

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

export default Notifications;
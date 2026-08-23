import { Link } from "react-router-dom";

function EventCard({ event }) {
  // ========================================
  // IMAGE URL
  // ========================================

  const imageUrl = event.banner
    ? event.banner.startsWith("http")
      ? event.banner
      : `http://localhost:5000${event.banner}`
    : "";


  // ========================================
  // DATE FORMAT
  // Example:
  // 2026-08-23 -> 23 Aug 2026
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

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (Number.isNaN(date.getTime())) {
      return "Date TBA";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };


  // ========================================
  // TIME FORMAT
  // Example:
  // 16:30:00 -> 04:30 PM
  // 09:15:00 -> 09:15 AM
  // 00:30:00 -> 12:30 AM
  // 12:00:00 -> 12:00 PM
  // ========================================

  const formatEventTime = (eventTime) => {
    if (!eventTime) {
      return "Time TBA";
    }

    const value = String(eventTime).trim();

    // Empty/default time
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

    // Safety for invalid hours
    if (hours < 0 || hours > 23) {
      return "Time TBA";
    }

    const period = hours >= 12 ? "PM" : "AM";

    // Convert 24-hour -> 12-hour
    hours = hours % 12;

    // 00 -> 12
    if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
  };


  // ========================================
  // FORMATTED VALUES
  // ========================================

  const dateText = formatEventDate(
    event.event_date
  );

  const timeText = formatEventTime(
    event.event_time
  );


  // ========================================
  // COMPONENT
  // ========================================

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">


      {/* ========================================
          IMAGE
      ======================================== */}

      <div className="relative h-48 overflow-hidden bg-slate-100 sm:h-52 lg:h-56">

        {imageUrl ? (

          <img
            src={imageUrl}
            alt={event.title}
            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.02]"
            onError={(e) => {
              console.error(
                "EVENT IMAGE ERROR:",
                event.title,
                event.banner
              );

              e.currentTarget.style.display = "none";
            }}
          />

        ) : (

          <div className="flex h-full items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-600 text-7xl">
            🎉
          </div>

        )}


        {/* Soft overlay */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />


        {/* CATEGORY */}

        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-indigo-600 shadow-lg">
          {event.category || "Event"}
        </span>


        {/* DATE */}

        <div className="absolute bottom-4 left-4 rounded-xl bg-black/70 px-3 py-2 text-sm font-bold text-white backdrop-blur">
          📅 {dateText}
        </div>

      </div>

      {/* ========================================
          CONTENT
      ======================================== */}

      <div className="p-4 sm:p-5 lg:p-6">

        {/* TITLE */}

        <h3 className="line-clamp-2 min-h-[3rem] text-lg font-black text-slate-900 sm:text-xl">
          {event.title}
        </h3>


        {/* DESCRIPTION */}

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">
          {event.description ||
            "Discover this upcoming event with EventEase India."}
        </p>


        {/* ========================================
            EVENT INFO
        ======================================== */}

        <div className="mt-5 space-y-3">


          {/* LOCATION */}

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

            <span className="text-lg">
              📍
            </span>

            <span className="text-sm font-semibold text-slate-600">
              {event.location ||
                "Location TBA"}
            </span>

          </div>


          {/* TIME */}

          <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

            <span className="text-lg">
              ⏰
            </span>

            <span className="text-sm font-semibold text-slate-600">
              {timeText}
            </span>

          </div>

        </div>


        {/* ========================================
            FOOTER
        ======================================== */}

        <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">


          {/* CAPACITY */}

          <div>

            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Capacity
            </p>

            <p className="mt-1 font-black text-slate-900">
              {event.capacity
                ? `${event.capacity} seats`
                : "Open"}
            </p>

          </div>


          {/* VIEW EVENT */}

          <Link
            to={`/events/${event.id}`}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-center text-sm font-bold text-white transition hover:bg-indigo-700 sm:w-auto"
          >
            View Event →
          </Link>

        </div>

      </div>

    </article>
  );
}

export default EventCard;
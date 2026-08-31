import { useState } from "react";
import { Link } from "react-router-dom";

function EventCard({ event }) {

  // ========================================
  // IMAGE ERROR STATE
  // ========================================

  const [imageError, setImageError] = useState(false);


  // ========================================
  // IMAGE URL
  // ========================================

  const imageUrl = (() => {

    if (!event.banner) {
      return "";
    }

    let banner = String(event.banner).trim();

    // Already complete URL
    if (
      banner.startsWith("http://") ||
      banner.startsWith("https://")
    ) {
      return banner;
    }

    // Fix https// without colon
    if (banner.startsWith("https//")) {
      banner = banner.replace(
        "https//",
        "https://"
      );

      return banner;
    }

    // Fix http// without colon
    if (banner.startsWith("http//")) {
      banner = banner.replace(
        "http//",
        "http://"
      );

      return banner;
    }

    // Relative upload path
    if (!banner.startsWith("/")) {
      banner = `/${banner}`;
    }

    return `https://eventease-india-api.onrender.com${banner}`;

  })();


  // ========================================
  // DATE FORMAT
  // ========================================

  const formatEventDate = (eventDate) => {

    if (!eventDate) {
      return "Date TBA";
    }

    const dateString =
      String(eventDate).substring(0, 10);

    const parts =
      dateString.split("-");

    if (parts.length !== 3) {
      return "Date TBA";
    }

    const [year, month, day] =
      parts.map(Number);

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

    const date =
      new Date(
        year,
        month - 1,
        day
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "Date TBA";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };


  // ========================================
  // TIME FORMAT
  // ========================================

  const formatEventTime = (eventTime) => {

    if (!eventTime) {
      return "Time TBA";
    }

    const value =
      String(eventTime).trim();

    if (
      value === "00:00:00" ||
      value === "00:00"
    ) {
      return "Time TBA";
    }

    const parts =
      value.split(":");

    if (parts.length < 2) {
      return "Time TBA";
    }

    let hours =
      Number(parts[0]);

    const minutes =
      parts[1];

    if (
      Number.isNaN(hours) ||
      Number.isNaN(Number(minutes))
    ) {
      return "Time TBA";
    }

    if (
      hours < 0 ||
      hours > 23
    ) {
      return "Time TBA";
    }

    const period =
      hours >= 12
        ? "PM"
        : "AM";

    hours =
      hours % 12;

    if (hours === 0) {
      hours = 12;
    }

    return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
  };


  // ========================================
  // FORMATTED VALUES
  // ========================================

  const dateText =
    formatEventDate(
      event.event_date
    );

  const timeText =
    formatEventTime(
      event.event_time
    );


  // ========================================
  // COMPONENT
  // ========================================

  return (

    <article
      className="
        group
        overflow-hidden
        rounded-3xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition
        duration-300
        hover:-translate-y-1
        hover:shadow-xl
      "
    >

      {/* ========================================
          IMAGE
      ======================================== */}

      <div
        className="
          relative
          h-48
          overflow-hidden
          bg-slate-100
          sm:h-52
          lg:h-56
        "
      >

        {/* IMAGE */}

        {!imageUrl || imageError ? (

          <div
            className="
              flex
              h-full
              items-center
              justify-center
              bg-gradient-to-br
              from-indigo-600
              to-violet-600
              text-7xl
            "
          >
            🎉
          </div>

        ) : (

          <img
            src={imageUrl}
            alt={
              event.title ||
              "Event"
            }
            className="
              h-full
              w-full
              object-cover
              transition
              duration-500
              group-hover:scale-[1.03]
            "
            onError={() => {

              console.error(
                "EVENT IMAGE FAILED:",
                {
                  title: event.title,
                  banner: event.banner,
                  imageUrl: imageUrl
                }
              );

              setImageError(true);

            }}
          />

        )}


        {/* OVERLAY */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-t
            from-black/30
            via-transparent
            to-transparent
          "
        />


        {/* CATEGORY */}

        <span
          className="
            absolute
            left-4
            top-4
            rounded-full
            bg-white/95
            px-3
            py-1.5
            text-xs
            font-black
            text-indigo-600
            shadow-lg
          "
        >
          {event.category || "Event"}
        </span>


        {/* DATE */}

        <div
          className="
            absolute
            bottom-4
            left-4
            rounded-xl
            bg-black/70
            px-3
            py-2
            text-sm
            font-bold
            text-white
            backdrop-blur
          "
        >
          📅 {dateText}
        </div>

      </div>


      {/* ========================================
          CONTENT
      ======================================== */}

      <div
        className="
          p-4
          sm:p-5
          lg:p-6
        "
      >

        {/* TITLE */}

        <h3
          className="
            line-clamp-2
            min-h-[3rem]
            text-lg
            font-black
            text-slate-900
            sm:text-xl
          "
        >
          {event.title}
        </h3>


        {/* DESCRIPTION */}

        <p
          className="
            mt-3
            line-clamp-2
            text-sm
            leading-6
            text-slate-500
          "
        >
          {event.description ||
            "Discover this upcoming event with EventEase India."}
        </p>


        {/* ========================================
            EVENT INFO
        ======================================== */}

        <div
          className="
            mt-5
            space-y-3
          "
        >

          {/* LOCATION */}

          <div
            className="
              flex
              items-start
              gap-3
              rounded-xl
              bg-slate-50
              px-3
              py-2.5
            "
          >

            <span className="text-lg">
              📍
            </span>

            <span
              className="
                text-sm
                font-semibold
                text-slate-600
              "
            >
              {event.location ||
                "Location TBA"}
            </span>

          </div>


          {/* TIME */}

          <div
            className="
              flex
              items-start
              gap-3
              rounded-xl
              bg-slate-50
              px-3
              py-2.5
            "
          >

            <span className="text-lg">
              ⏰
            </span>

            <span
              className="
                text-sm
                font-semibold
                text-slate-600
              "
            >
              {timeText}
            </span>

          </div>

        </div>


        {/* ========================================
            FOOTER
        ======================================== */}

        <div
          className="
            mt-5
            flex
            flex-col
            gap-4
            border-t
            border-slate-100
            pt-5
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          {/* CAPACITY */}

          <div>

            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Capacity
            </p>

            <p
              className="
                mt-1
                font-black
                text-slate-900
              "
            >
              {event.capacity
                ? `${event.capacity} seats`
                : "Open"}
            </p>

          </div>


          {/* VIEW EVENT */}

          <Link
            to={`/events/${event.id}`}
            className="
              w-full
              rounded-xl
              bg-indigo-600
              px-4
              py-2.5
              text-center
              text-sm
              font-bold
              text-white
              transition
              hover:bg-indigo-700
              sm:w-auto
            "
          >
            View Event →
          </Link>

        </div>

      </div>

    </article>
  );
}

export default EventCard;
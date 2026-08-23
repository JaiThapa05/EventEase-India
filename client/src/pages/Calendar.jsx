import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mainMonth, setMainMonth] = useState(new Date());
  const [miniMonth, setMiniMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // ========================================
  // DATE HELPERS
  // ========================================

  const getTodayKey = () => {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayKey = getTodayKey();


  // ========================================
  // GET EVENT DATE KEY
  // ========================================

  const getEventDateKey = (event) => {
    if (!event?.event_date) {
      return "";
    }

    const value = String(event.event_date);

    const match = value.match(
      /^(\d{4}-\d{2}-\d{2})/
    );

    if (match) {
      return match[1];
    }

    return "";
  };


  // ========================================
  // YYYY-MM-DD → LOCAL DATE
  // ========================================

  const makeLocalDate = (dateKey) => {
    if (!dateKey) {
      return null;
    }

    const [year, month, day] = dateKey
      .split("-")
      .map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  };


  // ========================================
  // IMAGE URL
  // ========================================

  const getImageUrl = (event) => {
    if (!event?.banner) {
      return "";
    }

    if (event.banner.startsWith("http")) {
      return event.banner;
    }

    return `https://eventease-india.onrender.com${event.banner}`;
  };


  // ========================================
  // FETCH EVENTS
  // ========================================

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "https://eventease-india.onrender.com/api/events"
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

    } catch (error) {

      console.error(
        "CALENDAR ERROR:",
        error
      );

      setError(
        "Unable to load calendar events."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {
    fetchEvents();
  }, []);


  // ========================================
  // UPCOMING EVENTS ONLY
  // ========================================

  const upcomingEvents = useMemo(() => {

    return events
      .filter((event) => {

        const dateKey =
          getEventDateKey(event);

        return (
          dateKey &&
          dateKey >= todayKey
        );

      })
      .sort((a, b) => {

        return getEventDateKey(a).localeCompare(
          getEventDateKey(b)
        );

      });

  }, [events, todayKey]);


  // ========================================
  // CURRENT MONTH EVENTS
  // ========================================

  const currentMonthEvents = useMemo(() => {

    const year =
      mainMonth.getFullYear();

    const month = String(
      mainMonth.getMonth() + 1
    ).padStart(2, "0");

    const prefix =
      `${year}-${month}`;

    return upcomingEvents.filter(
      (event) =>
        getEventDateKey(event).startsWith(
          prefix
        )
    );

  }, [upcomingEvents, mainMonth]);


  // ========================================
  // MONTH NAMES
  // ========================================

  const mainMonthName =
    mainMonth.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );

  const miniMonthName =
    miniMonth.toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );


  // ========================================
  // CURRENT MONTH START
  // ========================================

  const currentMonthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  );


  // ========================================
  // CHANGE MAIN MONTH
  // ========================================

  const changeMainMonth = (direction) => {

    const nextMonth = new Date(
      mainMonth.getFullYear(),
      mainMonth.getMonth() + direction,
      1
    );

    if (nextMonth < currentMonthStart) {
      return;
    }

    setMainMonth(nextMonth);
    setSelectedDate(null);
  };


  // ========================================
  // CHANGE MINI MONTH
  // ========================================

  const changeMiniMonth = (direction) => {

    const nextMonth = new Date(
      miniMonth.getFullYear(),
      miniMonth.getMonth() + direction,
      1
    );

    if (nextMonth < currentMonthStart) {
      return;
    }

    setMiniMonth(nextMonth);
    setSelectedDate(null);
  };


  // ========================================
  // GO TO TODAY
  // ========================================

  const goToToday = () => {

    const today = new Date();

    setMainMonth(today);
    setMiniMonth(today);
    setSelectedDate(null);
  };


  // ========================================
  // GET CALENDAR DAYS
  // ========================================

  const getCalendarDays = (date) => {

    const year =
      date.getFullYear();

    const month =
      date.getMonth();

    const firstDay =
      new Date(
        year,
        month,
        1
      ).getDay();

    const daysInMonth =
      new Date(
        year,
        month + 1,
        0
      ).getDate();

    const days = [];


    // Empty cells before month starts
    for (
      let i = 0;
      i < firstDay;
      i++
    ) {
      days.push(null);
    }


    // Actual days
    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push(day);
    }

    return days;
  };


  const miniDays =
    getCalendarDays(miniMonth);


  // ========================================
  // GET EVENTS FOR DATE
  // ========================================

  const getEventsForDate = (
    year,
    month,
    day
  ) => {

    const monthNumber =
      String(month + 1).padStart(2, "0");

    const dayNumber =
      String(day).padStart(2, "0");

    const key =
      `${year}-${monthNumber}-${dayNumber}`;

    return upcomingEvents.filter(
      (event) =>
        getEventDateKey(event) === key
    );
  };


  // ========================================
  // SELECTED DATE EVENTS
  // ========================================

  const selectedEvents = selectedDate
    ? upcomingEvents.filter(
        (event) =>
          getEventDateKey(event) ===
          selectedDate
      )
    : [];


  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-5 font-semibold text-slate-500">
            Loading calendar...
          </p>

        </div>

      </div>
    );
  }


  // ========================================
  // MAIN
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50">


      {/* ========================================
          HEADER
      ======================================== */}

      <section className="bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-6 py-14">

          <p className="mb-3 font-bold uppercase tracking-widest text-indigo-400">
            EVENTEASE INDIA
          </p>

          <h1 className="text-4xl font-black md:text-5xl">
            Event Calendar 📅
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Explore current events and discover upcoming events.
          </p>

        </div>

      </section>


      {/* ========================================
          MAIN CONTENT
      ======================================== */}

      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
            {error}
          </div>
        )}


        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">


          {/* ========================================
              LEFT SIDE
          ======================================== */}

          <section>


            {/* ========================================
                MONTH HEADER
            ======================================== */}

            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-bold uppercase tracking-widest text-indigo-600">
                  Current Month
                </p>

                <h2 className="mt-2 text-3xl font-black text-slate-900">
                  {mainMonthName}
                </h2>

                <p className="mt-1 text-slate-500">
                  {currentMonthEvents.length} upcoming event
                  {currentMonthEvents.length !== 1
                    ? "s"
                    : ""}
                </p>

              </div>


              {/* MONTH CONTROLS */}

              <div className="flex gap-2">

                <button
                  onClick={goToToday}
                  className="rounded-xl bg-indigo-50 px-4 py-2.5 font-bold text-indigo-600 transition hover:bg-indigo-100"
                >
                  Today
                </button>

                <button
                  onClick={() =>
                    changeMainMonth(-1)
                  }
                  disabled={
                    mainMonth.getFullYear() ===
                      currentMonthStart.getFullYear() &&
                    mainMonth.getMonth() ===
                      currentMonthStart.getMonth()
                  }
                  className="rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-40"
                >
                  ←
                </button>

                <button
                  onClick={() =>
                    changeMainMonth(1)
                  }
                  className="rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  →
                </button>

              </div>

            </div>


            {/* ========================================
                CURRENT MONTH EVENTS
            ======================================== */}

            {currentMonthEvents.length === 0 ? (

              <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm">

                <div className="text-6xl">
                  📅
                </div>

                <h3 className="mt-5 text-2xl font-black text-slate-900">
                  No upcoming events this month
                </h3>

                <p className="mt-2 text-slate-500">
                  Check the upcoming calendar for future months.
                </p>

              </div>

            ) : (

              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

                {currentMonthEvents.map(
                  (event) => {

                    const dateKey =
                      getEventDateKey(event);

                    const eventDate =
                      makeLocalDate(dateKey);

                    const imageUrl =
                      getImageUrl(event);

                    return (
                      <article
                        key={event.id}
                        className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >


                        {/* ========================================
                            EVENT IMAGE
                        ======================================== */}

                        <div className="relative h-52 overflow-hidden bg-slate-100">

                          {imageUrl ? (

                            <img
                              src={imageUrl}
                              alt={event.title}
                              className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-[1.02]"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />

                          ) : (

                            <div className="flex h-full items-center justify-center text-7xl">
                              📅
                            </div>

                          )}


                          {/* OVERLAY */}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />


                          {/* CATEGORY */}

                          <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-indigo-600 shadow-lg">
                            {event.category ||
                              "Event"}
                          </span>


                          {/* DATE */}

                          <div className="absolute bottom-4 left-4 text-white">

                            <p className="text-xs font-bold uppercase tracking-widest">
                              {eventDate?.toLocaleDateString(
                                "en-IN",
                                {
                                  month: "short",
                                }
                              )}
                            </p>

                            <p className="text-4xl font-black leading-none">
                              {eventDate?.getDate()}
                            </p>

                            <p className="mt-1 text-xs font-semibold">
                              {eventDate?.getFullYear()}
                            </p>

                          </div>

                        </div>


                        {/* ========================================
                            CONTENT
                        ======================================== */}

                        <div className="p-6">

                          <h3 className="line-clamp-2 text-xl font-black text-slate-900">
                            {event.title}
                          </h3>


                          {/* INFO */}

                          <div className="mt-5 space-y-3">


                            {/* TIME */}

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

                              <span className="text-lg">
                                ⏰
                              </span>

                              <span className="text-sm font-semibold text-slate-600">
                                {event.event_time &&
                                 event.event_time !== "00:00:00"
                                 ? event.event_time
                                : "Time TBA"}
                              </span>

                            </div>


                            {/* LOCATION */}

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

                              <span className="text-lg">
                                📍
                              </span>

                              <span className="text-sm font-semibold text-slate-600">
                                {event.location ||
                                  "India"}
                              </span>

                            </div>


                            {/* CAPACITY */}

                            <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-2.5">

                              <span className="text-lg">
                                👥
                              </span>

                              <span className="text-sm font-semibold text-slate-600">
                                {event.capacity
                                  ? `${event.capacity} seats`
                                  : "Unlimited"}
                              </span>

                            </div>

                          </div>


                          {/* VIEW EVENT */}

                          <Link
                            to={`/events/${event.id}`}
                            state={{
                              from: "/calendar",
                            }}
                            className="mt-6 block rounded-xl bg-slate-900 py-3 text-center font-bold text-white transition hover:bg-indigo-600"
                          >
                            View Event →
                          </Link>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            )}

          </section>


          {/* ========================================
              RIGHT SIDE MINI CALENDAR
          ======================================== */}

          <aside className="h-fit lg:sticky lg:top-24">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">


              {/* ========================================
                  MINI HEADER
              ======================================== */}

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Upcoming Calendar
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    {miniMonthName}
                  </h2>

                </div>


                {/* MINI CONTROLS */}

                <div className="flex gap-1">

                  <button
                    onClick={() =>
                      changeMiniMonth(-1)
                    }
                    disabled={
                      miniMonth.getFullYear() ===
                        currentMonthStart.getFullYear() &&
                      miniMonth.getMonth() ===
                        currentMonthStart.getMonth()
                    }
                    className="h-9 w-9 rounded-lg bg-slate-100 font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-40"
                  >
                    ←
                  </button>

                  <button
                    onClick={() =>
                      changeMiniMonth(1)
                    }
                    className="h-9 w-9 rounded-lg bg-slate-100 font-bold text-slate-700 transition hover:bg-slate-200"
                  >
                    →
                  </button>

                </div>

              </div>


              {/* ========================================
                  WEEK DAYS
              ======================================== */}

              <div className="mt-5 grid grid-cols-7">

                {[
                  "S",
                  "M",
                  "T",
                  "W",
                  "T",
                  "F",
                  "S",
                ].map(
                  (day, index) => (
                    <div
                      key={`${day}-${index}`}
                      className="py-2 text-center text-xs font-black text-slate-400"
                    >
                      {day}
                    </div>
                  )
                )}

              </div>


              {/* ========================================
                  MINI CALENDAR DAYS
              ======================================== */}

              <div className="grid grid-cols-7 gap-1">

                {miniDays.map(
                  (day, index) => {

                    if (!day) {

                      return (
                        <div
                          key={`empty-${index}`}
                          className="h-10"
                        />
                      );

                    }


                    const year =
                      miniMonth.getFullYear();

                    const month =
                      miniMonth.getMonth();


                    const monthNumber =
                      String(month + 1).padStart(
                        2,
                        "0"
                      );

                    const dayNumber =
                      String(day).padStart(
                        2,
                        "0"
                      );


                    const dateKey =
                      `${year}-${monthNumber}-${dayNumber}`;


                    const dayEvents =
                      getEventsForDate(
                        year,
                        month,
                        day
                      );


                    const isPast =
                      dateKey < todayKey;


                    const isToday =
                      dateKey === todayKey;


                    const isSelected =
                      dateKey === selectedDate;


                    return (
                      <button
                        key={day}
                        disabled={isPast}
                        onClick={() => {

                          if (!isPast) {
                            setSelectedDate(
                              dateKey
                            );
                          }

                        }}
                        className={`relative flex h-10 items-center justify-center rounded-xl text-sm font-bold transition ${
                          isPast
                            ? "cursor-not-allowed text-slate-300"
                            : isSelected
                            ? "bg-indigo-600 text-white"
                            : isToday
                            ? "bg-indigo-100 text-indigo-700"
                            : dayEvents.length > 0
                            ? "bg-violet-50 text-violet-700 hover:bg-violet-100"
                            : "text-slate-700 hover:bg-slate-100"
                        }`}
                      >

                        {day}


                        {dayEvents.length > 0 &&
                          !isSelected && (

                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-indigo-600" />

                          )}

                      </button>
                    );

                  }
                )}

              </div>


              {/* ========================================
                  SELECTED DATE
              ======================================== */}

              {selectedDate && (

                <div className="mt-6 border-t border-slate-200 pt-5">

                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                    Events on
                  </p>

                  <h3 className="mt-1 text-lg font-black text-slate-900">

                    {makeLocalDate(
                      selectedDate
                    )?.toLocaleDateString(
                      "en-IN",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}

                  </h3>


                  {selectedEvents.length === 0 ? (

                    <p className="mt-3 text-sm text-slate-500">
                      No events on this date.
                    </p>

                  ) : (

                    <div className="mt-4 space-y-3">

                      {selectedEvents.map(
                        (event) => {

                          const imageUrl =
                            getImageUrl(
                              event
                            );

                          return (
                            <Link
                              key={event.id}
                              to={`/events/${event.id}`}
                              state={{
                                from: "/calendar",
                              }}
                              className="flex gap-3 rounded-2xl bg-slate-50 p-3 transition hover:bg-indigo-50"
                            >

                              {/* SMALL IMAGE */}

                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200">

                                {imageUrl ? (

                                  <img
                                    src={imageUrl}
                                    alt={event.title}
                                    className="h-full w-full object-cover"
                                  />

                                ) : (

                                  <div className="flex h-full items-center justify-center">
                                    🎉
                                  </div>

                                )}

                              </div>


                              {/* INFO */}

                              <div className="min-w-0">

                                <p className="line-clamp-2 text-sm font-black text-slate-900">
                                  {event.title}
                                </p>

                                <p className="mt-1 text-xs text-slate-500">
                                  ⏰{" "}
                                  {event.event_time ||
                                    "Time TBA"}
                                </p>

                                <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                  📍{" "}
                                  {event.location ||
                                    "India"}
                                </p>

                              </div>

                            </Link>
                          );

                        }
                      )}

                    </div>

                  )}

                </div>

              )}


              {/* ========================================
                  COMING NEXT
              ======================================== */}

              <div className="mt-6 border-t border-slate-200 pt-5">

                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                  Coming Next
                </p>

                <div className="mt-4 space-y-3">

                  {upcomingEvents
                    .slice(0, 5)
                    .map(
                      (event) => {

                        const date =
                          makeLocalDate(
                            getEventDateKey(
                              event
                            )
                          );

                        const imageUrl =
                          getImageUrl(
                            event
                          );

                        return (
                          <Link
                            key={event.id}
                            to={`/events/${event.id}`}
                            state={{
                              from: "/calendar",
                            }}
                            className="flex gap-3 rounded-2xl border border-slate-100 p-3 transition hover:border-indigo-200 hover:bg-indigo-50"
                          >

                            {/* IMAGE */}

                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100">

                              {imageUrl ? (

                                <img
                                  src={imageUrl}
                                  alt={event.title}
                                  className="h-full w-full object-cover"
                                />

                              ) : (

                                <div className="flex h-full items-center justify-center">
                                  🎉
                                </div>

                              )}

                            </div>


                            {/* INFO */}

                            <div className="min-w-0">

                              <p className="line-clamp-2 text-sm font-bold text-slate-900">
                                {event.title}
                              </p>

                              <p className="mt-1 text-xs font-semibold text-indigo-600">

                                {date?.toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  }
                                )}

                              </p>

                            </div>

                          </Link>
                        );

                      }
                    )}

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>

    </div>
  );
}

export default Calendar;
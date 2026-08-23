import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ========================================
  // EVENT STATE
  // ========================================

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ========================================
  // REGISTRATION STATE
  // ========================================

  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

  // ========================================
  // REVIEW STATE
  // ========================================

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);


  // ========================================
  // IMAGE URL
  // ========================================

  const getImageUrl = (banner) => {
    if (!banner) {
      return "";
    }

    if (
      banner.startsWith("http://") ||
      banner.startsWith("https://")
    ) {
      return banner;
    }

    return `https://eventease-india.onrender.com${banner}`;
  };


  // ========================================
  // EVENT DATE
  // ========================================

  const formatEventDate = (eventDate) => {
    if (!eventDate) {
      return "Date not specified";
    }

    const dateString = String(
      eventDate
    ).substring(0, 10);

    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return "Date not specified";
    }

    const [year, month, day] =
      parts.map(Number);

    const date = new Date(
      year,
      month - 1,
      day
    );

    if (Number.isNaN(date.getTime())) {
      return "Date not specified";
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
// EVENT TIME
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

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, "0")}:${minutes} ${period}`;
};


  // ========================================
  // FETCH EVENT
  // ========================================

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `https://eventease-india.onrender.com/api/events/${id}`
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Event not found"
          );
        }

        setEvent(data);

      } catch (err) {
        console.error(
          "EVENT DETAILS ERROR:",
          err
        );

        setError(
          err.message ||
            "Unable to load event."
        );

      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);


  // ========================================
  // FETCH REVIEWS
  // ========================================

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://eventease-india.onrender.com/api/reviews/event/${id}`
      );

      const data =
        await response.json();

      if (response.ok) {
        setReviews(
          Array.isArray(data)
            ? data
            : []
        );
      }
    } catch (error) {
      console.error(
        "REVIEWS ERROR:",
        error
      );
    }
  };


  useEffect(() => {
    fetchReviews();
  }, [id]);


  // ========================================
  // INTERNAL EVENT REGISTRATION
  // ========================================

  const handleInternalRegistration =
    async () => {
      try {
        setRegistering(true);
        setRegisterMessage("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          setRegisterMessage(
            "Please login first."
          );
          return;
        }

        const response = await fetch(
          "https://eventease-india.onrender.com/api/registrations",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              event_id: event.id,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Registration failed"
          );
        }

        setRegisterMessage(
          "🎉 Successfully registered for this event!"
        );

      } catch (error) {
        console.error(
          "INTERNAL REGISTRATION ERROR:",
          error
        );

        setRegisterMessage(
          error.message ||
            "Registration failed"
        );

      } finally {
        setRegistering(false);
      }
    };


  // ========================================
  // EXTERNAL EVENT REGISTRATION
  // ========================================

  const handleExternalRegistration =
    async () => {
      try {
        setRegistering(true);
        setRegisterMessage("");

        const token =
          localStorage.getItem("token");

        if (!token) {
          setRegisterMessage(
            "Please login first."
          );

          setRegistering(false);
          return;
        }

        if (!event.registration_url) {
          throw new Error(
            "Official registration link is not available."
          );
        }

        const response = await fetch(
          "https://eventease-india.onrender.com/api/registrations/external-start",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",

              Authorization:
                `Bearer ${token}`,
            },

            body: JSON.stringify({
              event_id: event.id,
            }),
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Unable to start registration"
          );
        }


        // Save pending registration
        localStorage.setItem(
          "pendingExternalRegistration",
          JSON.stringify({
            registrationId:
              data.registrationId,

            eventId: event.id,
          })
        );


        // Inform user
        setRegisterMessage(
          "Registration started. Complete it on the official website."
        );


        // Open official website
        window.open(
          data.registrationUrl ||
            event.registration_url,
          "_blank",
          "noopener,noreferrer"
        );

      } catch (error) {
        console.error(
          "EXTERNAL REGISTRATION ERROR:",
          error
        );

        setRegisterMessage(
          error.message ||
            "Unable to start registration."
        );

      } finally {
        setRegistering(false);
      }
    };


  // ========================================
  // SUBMIT REVIEW
  // ========================================

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      setReviewLoading(true);
      setReviewMessage("");

      const token =
        localStorage.getItem("token");

      if (!token) {
        setReviewMessage(
          "Please login first."
        );

        return;
      }

      if (!comment.trim()) {
        setReviewMessage(
          "Please write a review."
        );

        return;
      }

      const response = await fetch(
        "https://eventease-india.onrender.com/api/reviews",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            event_id: event.id,
            rating,
            comment:
              comment.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit review"
        );
      }

      setReviewMessage(
        "⭐ Review submitted successfully!"
      );

      setComment("");
      setRating(5);

      await fetchReviews();

    } catch (error) {
      console.error(
        "SUBMIT REVIEW ERROR:",
        error
      );

      setReviewMessage(
        error.message ||
          "Something went wrong."
      );

    } finally {
      setReviewLoading(false);
    }
  };


  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="text-center">

          <div className="mb-4 text-5xl">
            ⏳
          </div>

          <h2 className="text-2xl font-bold text-slate-800">
            Loading event...
          </h2>

        </div>

      </div>
    );
  }


  // ========================================
  // ERROR
  // ========================================

  if (error || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">

        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">

          <div className="mb-5 text-6xl">
            😕
          </div>

          <h1 className="mb-3 text-3xl font-bold text-slate-900">
            Event not found
          </h1>

          <p className="mb-7 text-slate-500">
            {error ||
              "This event may have been deleted or doesn't exist."}
          </p>

          <Link
            to="/events"
            className="inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            ← Back to Events
          </Link>

        </div>

      </div>
    );
  }


  // ========================================
  // VALUES
  // ========================================

  const imageUrl =
    getImageUrl(event.banner);

  const formattedDate =
    formatEventDate(
      event.event_date
    );

  const formattedTime =
    formatEventTime(
      event.event_time
    );

  const isExternalEvent =
  event.registration_type === "external";


  // ========================================
  // MAIN
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50">


      {/* ========================================
          HERO
      ======================================== */}

      <section className="bg-slate-950 text-white">

        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

          {/* BACK */}

          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            ← Back
          </button>


          <div className="mt-8">

            {/* CATEGORY */}

            <span className="inline-block rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-300">
              {event.category ||
                "Event"}
            </span>


            {/* TITLE */}

            <h1 className="mt-5 max-w-5xl text-3xl font-black leading-tight sm:text-4xl lg:text-6xl">
              {event.title}
            </h1>


            {/* DESCRIPTION */}

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              {event.description ||
                "Discover this event with EventEase India."}
            </p>


            {/* BANNER */}

            {imageUrl && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-slate-100 shadow-2xl">

                <img
                  src={imageUrl}
                  alt={event.title}
                  className="h-52 w-full object-contain p-2 sm:h-72 sm:p-3 lg:h-[480px]"
                  onError={(e) => {
                    console.error(
                      "EVENT BANNER ERROR:",
                      event.banner
                    );

                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>
            )}

          </div>

        </div>

      </section>


      {/* ========================================
          CONTENT
      ======================================== */}

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        <div className="grid gap-8 lg:grid-cols-3">


          {/* ========================================
              LEFT
          ======================================== */}

          <div className="lg:col-span-2">


            {/* ABOUT */}

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">

              <h2 className="text-2xl font-bold text-slate-900">
                About This Event
              </h2>

              <p className="mt-5 whitespace-pre-line leading-8 text-slate-600">
                {event.description ||
                  "No description available."}
              </p>

            </div>


            {/* REVIEWS */}

            <section className="mt-10">

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">

                <h2 className="text-2xl font-black text-slate-900">
                  ⭐ Rate This Event
                </h2>

                <p className="mt-2 text-slate-500">
                  Share your experience with other participants.
                </p>


                <form
                  onSubmit={submitReview}
                  className="mt-6"
                >

                  {/* RATING */}

                  <label className="mb-3 block font-bold text-slate-700">
                    Your Rating
                  </label>

                  <div className="mb-6 flex gap-1.5 text-2xl sm:gap-2 sm:text-3xl">

                    {[1, 2, 3, 4, 5].map(
                      (star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() =>
                            setRating(star)
                          }
                          className="transition hover:scale-110"
                          aria-label={`Rate ${star} star`}
                        >
                          {star <= rating
                            ? "⭐"
                            : "☆"}
                        </button>
                      )
                    )}

                  </div>


                  {/* COMMENT */}

                  <label className="mb-2 block font-bold text-slate-700">
                    Your Review
                  </label>

                  <textarea
                    value={comment}
                    onChange={(e) =>
                      setComment(
                        e.target.value
                      )
                    }
                    placeholder="Tell us about your experience..."
                    rows="4"
                    className="w-full rounded-xl border border-slate-200 p-4 outline-none transition focus:ring-2 focus:ring-indigo-500"
                  />


                  {/* REVIEW MESSAGE */}

                  {reviewMessage && (
                    <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-indigo-700">
                      {reviewMessage}
                    </div>
                  )}


                  {/* SUBMIT */}

                  <button
                    type="submit"
                    disabled={reviewLoading}
                    className="mt-5 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {reviewLoading
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>

                </form>

              </div>

            </section>


            {/* ========================================
                PARTICIPANT REVIEWS
            ======================================== */}

            <section className="mt-8">

              <h2 className="mb-6 text-2xl font-black text-slate-900">
                💬 Participant Reviews
              </h2>


              {reviews.length === 0 ? (

                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">

                  <p className="text-slate-500">
                    No reviews yet. Be the first to review this event!
                  </p>

                </div>

              ) : (

                <div className="space-y-5">

                  {reviews.map(
                    (review) => {

                      const profileImage =
                        review.profile_photo
                          ? review.profile_photo.startsWith(
                              "http://"
                            ) ||
                            review.profile_photo.startsWith(
                              "https://"
                            )
                            ? review.profile_photo
                            : `https://eventease-india.onrender.com${review.profile_photo}`
                          : "";

                      return (
                        <div
                          key={review.id}
                          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                        >

                          <div className="flex items-center gap-4">

                            {profileImage ? (

                              <img
                                src={
                                  profileImage
                                }
                                alt={
                                  review.name ||
                                  "Participant"
                                }
                                className="h-12 w-12 rounded-full object-cover"
                              />

                            ) : (

                              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                {review.name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "U"}
                              </div>

                            )}


                            <div className="min-w-0">

                              <h3 className="font-bold text-slate-900">
                                {review.name ||
                                  "Participant"}
                              </h3>

                              <div className="text-sm">
                                {"⭐".repeat(
                                  Math.max(
                                    0,
                                    Math.min(
                                      5,
                                      Number(
                                        review.rating
                                      ) || 0
                                    )
                                  )
                                )}
                              </div>

                            </div>

                          </div>


                          {review.comment && (
                            <p className="mt-4 leading-7 text-slate-600">
                              {review.comment}
                            </p>
                          )}

                        </div>
                      );
                    }
                  )}

                </div>

              )}

            </section>

          </div>


          {/* ========================================
              RIGHT SIDEBAR
          ======================================== */}

          <div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg sm:p-6 lg:sticky lg:top-24 lg:p-7">

              <h2 className="mb-6 text-xl font-bold text-slate-900">
                Event Information
              </h2>


              {/* DATE */}

              <div className="mb-6 flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                  📅
                </div>

                <div>

                  <p className="text-sm text-slate-400">
                    Date
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formattedDate}
                  </p>

                </div>

              </div>


              {/* TIME */}

              <div className="mb-6 flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  ⏰
                </div>

                <div>

                  <p className="text-sm text-slate-400">
                    Time
                  </p>

                  <p className="font-semibold text-slate-800">
                    {formattedTime}
                  </p>

                </div>

              </div>


              {/* LOCATION */}

              <div className="mb-6 flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-xl">
                  📍
                </div>

                <div className="min-w-0">

                  <p className="text-sm text-slate-400">
                    Location
                  </p>

                  <p className="break-words font-semibold text-slate-800">
                    {event.location ||
                      "India"}
                  </p>

                </div>

              </div>


              {/* CAPACITY */}

              <div className="mb-7 flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl">
                  👥
                </div>

                <div>

                  <p className="text-sm text-slate-400">
                    Capacity
                  </p>

                  <p className="font-semibold text-slate-800">
                    {event.capacity
                      ? `${event.capacity} participants`
                      : "Unlimited"}
                  </p>

                </div>

              </div>


              {/* OFFICIAL ATTENDANCE */}

              {event.official_attendees && (
                <div className="mb-7 flex items-center gap-3">

                  <span className="text-xl">
                    🌍
                  </span>

                  <div>

                    <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                      Official Attendance
                    </p>

                    <p className="font-semibold text-slate-700">
                      {event.official_attendees}
                    </p>

                  </div>

                </div>
              )}


              {/* ========================================
                  REGISTRATION
              ======================================== */}

              {isExternalEvent ? (

                <div>

                  <button
                    type="button"
                    onClick={
                      handleExternalRegistration
                    }
                    disabled={registering}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-base font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 sm:py-4 sm:text-lg disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {registering
                      ? "Starting..."
                      : "🎟️ Register on Official Website ↗"}
                  </button>

                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                    Registration is completed on the organizer's website.
                    EventEase will only show the event in My Events after
                    a verified registration confirmation.
                  </p>

                </div>

              ) : (

                <button
                  type="button"
                  onClick={
                    handleInternalRegistration
                  }
                  disabled={registering}
                  className="w-full rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {registering
                    ? "Registering..."
                    : "🎟️ Register for Event"}
                </button>

              )}


              {/* REGISTER MESSAGE */}

              {registerMessage && (
                <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-center text-sm font-medium text-indigo-700">
                  {registerMessage}
                </div>
              )}

            </aside>

          </div>

        </div>

      </main>

    </div>
  );
}

export default EventDetails;
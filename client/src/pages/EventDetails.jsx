import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

// ======================================================
// DEPLOYED BACKEND API
// ======================================================

const API_BASE_URL = "https://eventease-india-api.onrender.com";

// ======================================================
// EVENT DETAILS
// ======================================================

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ======================================================
  // EVENT STATE
  // ======================================================

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ======================================================
  // REGISTRATION STATE
  // ======================================================

  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState("");

  // ======================================================
  // REVIEW STATE
  // ======================================================

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // ======================================================
  // IMAGE URL
  // ======================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    const value = String(image).trim();

    if (
      value.startsWith("http://") ||
      value.startsWith("https://")
    ) {
      return value;
    }

    if (value.startsWith("/")) {
      return `${API_BASE_URL}${value}`;
    }

    return `${API_BASE_URL}/${value}`;
  };

  // ======================================================
  // DATE FORMAT
  // ======================================================

  const formatEventDate = (eventDate) => {
    if (!eventDate) {
      return "Date not specified";
    }

    const dateString = String(eventDate).substring(0, 10);
    const parts = dateString.split("-");

    if (parts.length !== 3) {
      return "Date not specified";
    }

    const [year, month, day] = parts.map(Number);

    if (!year || !month || !day) {
      return "Date not specified";
    }

    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return "Date not specified";
    }

    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ======================================================
  // TIME FORMAT
  // ======================================================

  const formatEventTime = (eventTime) => {
    if (!eventTime) {
      return "Time TBA";
    }

    const value = String(eventTime).trim();

    if (value === "00:00:00" || value === "00:00") {
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

  // ======================================================
  // FETCH EVENT
  // ======================================================

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/events/${id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Event not found"
          );
        }

        setEvent(data);
      } catch (err) {
        console.error("EVENT DETAILS ERROR:", err);

        setError(
          err.message || "Unable to load event."
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  // ======================================================
  // FETCH REVIEWS
  // ======================================================

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/reviews/event/${id}`
      );

      const data = await response.json();

      console.log("REVIEWS RESPONSE:", data);

      if (
        response.ok &&
        Array.isArray(data)
      ) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error(
        "FETCH REVIEWS ERROR:",
        error
      );

      setReviews([]);
    }
  };

  // ======================================================
  // LOAD REVIEWS
  // ======================================================

  useEffect(() => {
    if (id) {
      fetchReviews();
    }
  }, [id]);

  // ======================================================
  // INTERNAL REGISTRATION
  // ======================================================

  const handleInternalRegistration = async () => {
    try {
      setRegistering(true);
      setRegisterMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setRegisterMessage(
          "Please login first."
        );
        return;
      }

      if (!event?.id) {
        setRegisterMessage(
          "Event information is not available."
        );
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_id: event.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Registration failed."
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
          "Registration failed."
      );
    } finally {
      setRegistering(false);
    }
  };

  // ======================================================
  // EXTERNAL REGISTRATION
  // ======================================================

  const handleExternalRegistration = async () => {
    try {
      setRegistering(true);
      setRegisterMessage("");

      const token = localStorage.getItem("token");

      if (!token) {
        setRegisterMessage(
          "Please login first."
        );
        return;
      }

      if (!event?.registration_url) {
        throw new Error(
          "Official registration link is not available."
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/registrations/external-start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_id: event.id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to start registration."
        );
      }

      localStorage.setItem(
        "pendingExternalRegistration",
        JSON.stringify({
          registrationId:
            data.registrationId,
          eventId: event.id,
        })
      );

      setRegisterMessage(
        "Registration started. Complete it on the official website."
      );

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

  // ======================================================
  // SUBMIT REVIEW
  // ======================================================

  const submitReview = async (e) => {
    e.preventDefault();

    try {
      setReviewLoading(true);
      setReviewMessage("");

      const token = localStorage.getItem("token");

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
        `${API_BASE_URL}/api/reviews`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            event_id: event.id,
            rating: Number(rating),
            comment: comment.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit review."
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

  // ======================================================
  // LOADING
  // ======================================================

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

  // ======================================================
  // ERROR
  // ======================================================

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

  // ======================================================
  // VALUES
  // ======================================================

  const imageUrl = getImageUrl(event.banner);

  const formattedDate =
    formatEventDate(event.event_date);

  const formattedTime =
    formatEventTime(event.event_time);

  const isExternalEvent =
    event.registration_type === "external";

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ==================================================
          HERO
      ================================================== */}

      <section className="bg-slate-950 text-white">

        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            ← Back
          </button>

          <div className="mt-8">

            <span className="inline-block rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold text-indigo-300">
              {event.category || "Event"}
            </span>

            <h1 className="mt-5 max-w-5xl text-3xl font-black leading-tight sm:text-4xl lg:text-6xl">
              {event.title}
            </h1>

            <p className="mt-5 max-w-4xl text-lg leading-8 text-slate-300">
              {event.description ||
                "Discover this event with EventEase India."}
            </p>

            {imageUrl && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl">

                <img
                  src={imageUrl}
                  alt={event.title || "Event banner"}
                  className="h-56 w-full object-contain p-2 sm:h-80 lg:h-[480px]"
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

      {/* ==================================================
          MAIN CONTENT
          
          DESKTOP:
          LEFT  = Event Information
          RIGHT = About + Rate + Reviews
      ================================================== */}

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">

        <div
          className="
            grid
            grid-cols-1
            gap-8
            lg:grid-cols-[320px_minmax(0,1fr)]
            lg:items-start
          "
        >

          {/* ==================================================
              LEFT SIDE
              EVENT INFORMATION
          ================================================== */}

          <aside className="w-full">

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg lg:sticky lg:top-24">

              <h2 className="mb-7 text-2xl font-black text-slate-900">
                Event Information
              </h2>

              {/* DATE */}

              <div className="mb-6 flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                  📅
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-medium text-slate-400">
                    Date
                  </p>

                  <p className="mt-1 break-words font-semibold text-slate-800">
                    {formattedDate}
                  </p>

                </div>

              </div>

              {/* TIME */}

              <div className="mb-6 flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-xl">
                  ⏰
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-medium text-slate-400">
                    Time
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
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

                  <p className="text-sm font-medium text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 break-words font-semibold text-slate-800">
                    {event.location || "India"}
                  </p>

                </div>

              </div>

              {/* CAPACITY */}

              <div className="mb-6 flex gap-4">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-xl">
                  👥
                </div>

                <div className="min-w-0">

                  <p className="text-sm font-medium text-slate-400">
                    Capacity
                  </p>

                  <p className="mt-1 font-semibold text-slate-800">
                    {event.capacity
                      ? `${event.capacity} participants`
                      : "Unlimited"}
                  </p>

                </div>

              </div>

              {/* OFFICIAL ATTENDANCE */}

              {event.official_attendees && (
                <div className="mb-7 flex gap-4">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    🌍
                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-medium text-slate-400">
                      Official Attendance
                    </p>

                    <p className="mt-1 break-words font-semibold text-slate-800">
                      {event.official_attendees}
                    </p>

                  </div>

                </div>
              )}

              <div className="my-6 border-t border-slate-200" />

              {/* REGISTRATION */}

              {isExternalEvent ? (
                <div>

                  <button
                    type="button"
                    onClick={
                      handleExternalRegistration
                    }
                    disabled={registering}
                    className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-base font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                  >
                    {registering
                      ? "Starting..."
                      : "🎟️ Register on Official Website ↗"}
                  </button>

                  <p className="mt-3 text-center text-xs leading-5 text-slate-500">
                    Registration is completed on the organizer's website.
                  </p>

                </div>
              ) : (
                <button
                  type="button"
                  onClick={
                    handleInternalRegistration
                  }
                  disabled={registering}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {registering
                    ? "Registering..."
                    : "🎟️ Register for Event"}
                </button>
              )}

              {registerMessage && (
                <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-center text-sm font-semibold text-indigo-700">
                  {registerMessage}
                </div>
              )}

            </div>

          </aside>

          {/* ==================================================
              RIGHT SIDE
              ABOUT + RATE + REVIEWS
          ================================================== */}

          <div className="min-w-0">

            {/* ==================================================
                ABOUT THIS EVENT
            ================================================== */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                About This Event
              </h2>

              <div className="mt-5 h-1 w-16 rounded-full bg-indigo-600" />

              <p className="mt-6 whitespace-pre-line text-base leading-8 text-slate-600">
                {event.description ||
                  "No description available."}
              </p>

            </section>

            {/* ==================================================
                RATE THIS EVENT
            ================================================== */}

            <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                ⭐ Rate This Event
              </h2>

              <p className="mt-2 text-slate-500">
                Share your experience with other participants.
              </p>

              <form
                onSubmit={submitReview}
                className="mt-7"
              >

                <label className="mb-3 block font-bold text-slate-700">
                  Your Rating
                </label>

                <div className="mb-7 flex gap-2 text-3xl">

                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(star)
                        }
                        className="transition hover:scale-110"
                        aria-label={`Rate ${star} stars`}
                      >
                        {star <= rating
                          ? "⭐"
                          : "☆"}
                      </button>
                    )
                  )}

                </div>

                <label className="mb-2 block font-bold text-slate-700">
                  Your Review
                </label>

                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="Tell us about your experience..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-200 p-4 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />

                {reviewMessage && (
                  <div className="mt-4 rounded-xl bg-indigo-50 p-4 text-sm font-semibold text-indigo-700">
                    {reviewMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="mt-5 rounded-xl bg-indigo-600 px-7 py-3.5 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {reviewLoading
                    ? "Submitting..."
                    : "Submit Review"}
                </button>

              </form>

            </section>

            {/* ==================================================
                PARTICIPANT REVIEWS
            ================================================== */}

            <section className="mt-8">

              <h2 className="mb-6 text-2xl font-black text-slate-900 sm:text-3xl">
                💬 Participant Reviews
              </h2>

              {reviews.length === 0 ? (

                <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                  <div className="mb-3 text-4xl">
                    💭
                  </div>

                  <p className="font-medium text-slate-500">
                    No reviews yet.
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Be the first to review this event!
                  </p>

                </div>

              ) : (

                <div className="space-y-5">

                  {reviews.map((review) => {

                    const profileImage =
                      getImageUrl(
                        review.profile_photo
                      );

                    const reviewRating =
                      Math.max(
                        0,
                        Math.min(
                          5,
                          Number(
                            review.rating
                          ) || 0
                        )
                      );

                    return (
                      <article
                        key={review.id}
                        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                      >

                        <div className="flex items-center gap-4">

                          {profileImage ? (

                            <img
                              src={profileImage}
                              alt={
                                review.name ||
                                "Participant"
                              }
                              className="h-12 w-12 shrink-0 rounded-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />

                          ) : (

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                              {review.name
                                ?.charAt(0)
                                ?.toUpperCase() ||
                                "U"}
                            </div>

                          )}

                          <div className="min-w-0">

                            <h3 className="truncate font-bold text-slate-900">
                              {review.name ||
                                "Participant"}
                            </h3>

                            <div className="mt-1 text-sm">

                              {"⭐".repeat(
                                reviewRating
                              )}

                              {reviewRating < 5 && (
                                <span className="text-slate-300">
                                  {"⭐".repeat(
                                    5 -
                                      reviewRating
                                  )}
                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                        {review.comment && (
                          <p className="mt-5 whitespace-pre-line leading-7 text-slate-600">
                            {review.comment}
                          </p>
                        )}

                      </article>
                    );
                  })}

                </div>

              )}

            </section>

          </div>

        </div>

      </main>

    </div>
  );
}

export default EventDetails;
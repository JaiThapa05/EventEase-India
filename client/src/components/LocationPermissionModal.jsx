import { useEffect, useState } from "react";

function LocationPermissionModal() {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // ========================================
  // CHECK LOGIN + POPUP FLAG
  // ========================================

  useEffect(() => {
    const checkLocationPopup = () => {
      const token = sessionStorage.getItem("token");

      const user = JSON.parse(
        sessionStorage.getItem("user") || "null"
      );

      const shouldShow =
        sessionStorage.getItem(
          "showLocationPopup"
        );

      console.log(
        "📍 LOCATION POPUP CHECK:",
        {
          token: !!token,
          userId: user?.id,
          shouldShow,
        }
      );

      // User login nahi hai
      if (!token || !user?.id) {
        setShowModal(false);
        return;
      }

      // Login ke baad popup show karna hai
      if (shouldShow === "true") {
        setShowModal(true);

        // Flag consume kar do
        sessionStorage.removeItem(
          "showLocationPopup"
        );
      }
    };

    // Initial check
    checkLocationPopup();

    // Login ke baad auth update
    window.addEventListener(
      "auth-updated",
      checkLocationPopup
    );

    // Backup: custom popup event
    window.addEventListener(
      "open-location-popup",
      checkLocationPopup
    );

    return () => {
      window.removeEventListener(
        "auth-updated",
        checkLocationPopup
      );

      window.removeEventListener(
        "open-location-popup",
        checkLocationPopup
      );
    };
  }, []);

  // ========================================
  // DENY
  // ========================================

  const handleDeny = () => {
    setSaving(false);
    setShowModal(false);
  };

  // ========================================
  // ALLOW
  // ========================================

  const handleAllow = () => {
    const token =
      sessionStorage.getItem("token");

    if (!token) {
      setShowModal(false);
      return;
    }

    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by your browser."
      );

      setShowModal(false);
      return;
    }

    setSaving(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        console.log(
          "✅ GEOLOCATION SUCCESS"
        );

        const latitude =
          position.coords.latitude;

        const longitude =
          position.coords.longitude;

        console.log(
          "📍 COORDINATES:",
          latitude,
          longitude
        );

        try {
          const response = await fetch(
            "https://eventease-india-api.onrender.com/api/profile/location",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body: JSON.stringify({
                latitude,
                longitude,
              }),
            }
          );

          const data =
            await response.json();

          console.log(
            "LOCATION API RESPONSE:",
            data
          );

          if (!response.ok) {
            throw new Error(
              data.message ||
              "Failed to save location"
            );
          }

          // Update Home immediately
          window.dispatchEvent(
            new CustomEvent(
              "location-updated",
              {
                detail:
                  data.location,
              }
            )
          );

          const user =
            JSON.parse(
              sessionStorage.getItem(
                "user"
              ) || "null"
            );

          if (user?.id) {
            sessionStorage.setItem(
              `locationSaved_${user.id}`,
              "true"
            );
          }

          console.log(
            "✅ LOCATION SAVED"
          );

          setSaving(false);
          setShowModal(false);

        } catch (error) {
          console.error(
            "❌ LOCATION SAVE ERROR:",
            error
          );

          setSaving(false);
          setShowModal(false);

          alert(
            "Unable to save your location."
          );
        }
      },

      (error) => {
        console.error(
          "❌ GEOLOCATION ERROR:",
          error.code,
          error.message
        );

        setSaving(false);
        setShowModal(false);

        alert(
          `Location error: ${error.code} - ${error.message}`
        );
      },

      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 600000,
      }
    );
  };

  // ========================================
  // NOTHING TO SHOW
  // ========================================

  if (!showModal) {
    return null;
  }

  // ========================================
  // MODAL
  // ========================================

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-5">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        {/* ICON */}

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
          📍
        </div>

        {/* TITLE */}

        <h2 className="mt-5 text-center text-2xl font-black text-slate-900">
          Allow Location Access?
        </h2>

        {/* DESCRIPTION */}

        <p className="mt-3 text-center leading-7 text-slate-500">
          Allow EventEase to use your location
          so we can help you discover events
          near you.
        </p>

        {/* BUTTONS */}

        <div className="mt-7 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={handleDeny}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Deny
          </button>

          <button
            type="button"
            onClick={handleAllow}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving
              ? "Getting Location..."
              : "Allow"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default LocationPermissionModal;
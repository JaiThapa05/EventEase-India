import { useEffect, useState } from "react";
import API_URL from "../api";

function LocationPermissionModal() {
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkLocation = async () => {
      const token = sessionStorage.getItem("token");
      const userString = sessionStorage.getItem("user");

      if (!token || !userString) {
        setShowModal(false);
        return;
      }

      let user;

      try {
        user = JSON.parse(userString);
      } catch {
        setShowModal(false);
        return;
      }

      if (!user?.id) {
        setShowModal(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          setShowModal(false);
          return;
        }

        const data = await response.json();

        const hasLocation =
          data.location_city &&
          data.location_state;

        if (!hasLocation) {
          setShowModal(true);
        } else {
          setShowModal(false);
        }
      } catch (error) {
        console.error(
          "LOCATION CHECK ERROR:",
          error
        );

        setShowModal(false);
      }
    };

    checkLocation();

    const handleAuthUpdated = () => {
      checkLocation();
    };

    window.addEventListener(
      "auth-updated",
      handleAuthUpdated
    );

    return () => {
      window.removeEventListener(
        "auth-updated",
        handleAuthUpdated
      );
    };
  }, []);

  const handleDeny = () => {
    setSaving(false);
    setShowModal(false);
  };

  const handleAllow = () => {
    const token = sessionStorage.getItem("token");

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
            `${API_URL}/api/profile/location`,
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

          window.dispatchEvent(
            new CustomEvent(
              "location-updated",
              {
                detail: data.location,
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

          setSaving(false);
          setShowModal(false);

          console.log(
            "✅ LOCATION SAVED"
          );
        } catch (error) {
          console.error(
            "❌ LOCATION SAVE ERROR:",
            error
          );

          setSaving(false);
          setShowModal(false);

          alert(
            error.message ||
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

  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-5">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-3xl">
          📍
        </div>

        <h2 className="mt-5 text-center text-2xl font-black text-slate-900">
          Allow Location Access?
        </h2>

        <p className="mt-3 text-center leading-7 text-slate-500">
          Allow EventEase to use your location
          so we can help you discover events
          near you.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3">

          <button
            type="button"
            onClick={handleDeny}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-5 py-3 font-bold text-slate-700 hover:bg-slate-100"
          >
            Deny
          </button>

          <button
            type="button"
            onClick={handleAllow}
            disabled={saving}
            className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
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
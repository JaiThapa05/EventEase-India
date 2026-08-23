import { useEffect, useState } from "react";

function LocationSelector({
  currentLocation,
  onClose,
  onLocationUpdated
}) {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [locations, setLocations] = useState([]);

  const [stateId, setStateId] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [locationId, setLocationId] = useState("");

  const [search, setSearch] = useState("");

  const [statesLoading, setStatesLoading] = useState(false);
  const [districtsLoading, setDistrictsLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);


  // ========================================
  // LOAD STATES
  // ========================================

  useEffect(() => {
    const loadStates = async () => {
      try {
        const token =
          localStorage.getItem("token");

        setStatesLoading(true);

        const response = await fetch(
          "http://localhost:5000/api/profile/locations/states",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to load states"
          );
        }

        setStates(data);

      } catch (error) {

        console.error(
          "STATES ERROR:",
          error
        );

      } finally {
        setStatesLoading(false);
      }
    };

    loadStates();
  }, []);


  // ========================================
  // LOAD DISTRICTS
  // ========================================

  useEffect(() => {

    if (!stateId) {
      setDistricts([]);
      setDistrictId("");
      setLocations([]);
      setLocationId("");
      return;
    }

    const loadDistricts = async () => {

      try {

        const token =
          localStorage.getItem("token");

        setDistrictsLoading(true);

        const response = await fetch(
          `http://localhost:5000/api/profile/locations/districts/${stateId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            "Failed to load districts"
          );
        }

        setDistricts(data);

      } catch (error) {

        console.error(
          "DISTRICTS ERROR:",
          error
        );

      } finally {

        setDistrictsLoading(false);

      }
    };

    loadDistricts();

    setDistrictId("");
    setLocationId("");
    setLocations([]);
    setSearch("");

  }, [stateId]);


  // ========================================
  // LOAD LOCATIONS
  // ========================================

  useEffect(() => {

    if (!districtId) {
      setLocations([]);
      setLocationId("");
      return;
    }

    const timer = setTimeout(
      async () => {

        try {

          const token =
            localStorage.getItem("token");

          setLocationsLoading(true);

          const url =
            `http://localhost:5000/api/profile/locations/search` +
            `?districtId=${districtId}` +
            `&search=${encodeURIComponent(search)}`;

          const response = await fetch(
            url,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data.message ||
              "Failed to load locations"
            );
          }

          setLocations(data);

        } catch (error) {

          console.error(
            "LOCATIONS ERROR:",
            error
          );

          setLocations([]);

        } finally {

          setLocationsLoading(false);

        }

      },
      300
    );

    return () => {
      clearTimeout(timer);
    };

  }, [districtId, search]);


  // ========================================
  // SAVE LOCATION
  // ========================================

  const handleSave = async () => {

    if (
      !stateId ||
      !districtId ||
      !locationId
    ) {
      alert(
        "Please select state, district and location."
      );

      return;
    }

    try {

      setSaving(true);

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/profile/manual-location",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization:
              `Bearer ${token}`
          },

          body: JSON.stringify({
            stateId,
            districtId,
            locationId
          })
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update location"
        );
      }

      // Update Home immediately
      window.dispatchEvent(
        new CustomEvent(
          "location-updated",
          {
            detail: data.location
          }
        )
      );

      onLocationUpdated(
        data.location
      );

      onClose();

    } catch (error) {

      console.error(
        "MANUAL LOCATION ERROR:",
        error
      );

      alert(
        error.message ||
        "Failed to save location"
      );

    } finally {

      setSaving(false);

    }
  };


  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm">

      <div className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Location
            </p>

            <h2 className="mt-1 text-2xl font-black text-slate-900">
              Change Location
            </h2>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 px-3 py-2 font-bold text-slate-600 hover:bg-slate-200"
          >
            ✕
          </button>

        </div>


        {/* STATE */}

        <div className="mt-6">

          <label className="mb-2 block text-sm font-bold text-slate-700">
            State
          </label>

          <select
            value={stateId}
            onChange={(e) =>
              setStateId(e.target.value)
            }
            disabled={statesLoading}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 disabled:opacity-50"
          >

            <option value="">
              {statesLoading
                ? "Loading states..."
                : "Select State"}
            </option>

            {states.map((state) => (

              <option
                key={state.id}
                value={state.id}
              >
                {state.name}
              </option>

            ))}

          </select>

        </div>


        {/* DISTRICT */}

        <div className="mt-5">

          <label className="mb-2 block text-sm font-bold text-slate-700">
            District
          </label>

          <select
            value={districtId}
            onChange={(e) =>
              setDistrictId(e.target.value)
            }
            disabled={
              !stateId ||
              districtsLoading
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 disabled:opacity-50"
          >

            <option value="">
              {districtsLoading
                ? "Loading districts..."
                : "Select District"}
            </option>

            {districts.map((district) => (

              <option
                key={district.id}
                value={district.id}
              >
                {district.name}
              </option>

            ))}

          </select>

        </div>


        {/* SEARCH */}

        <div className="mt-5">

          <label className="mb-2 block text-sm font-bold text-slate-700">
            City / Town / Village
          </label>

          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setLocationId("");
            }}
            disabled={!districtId}
            placeholder={
              districtId
                ? "Search city or village..."
                : "Select district first"
            }
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-indigo-500 disabled:opacity-50"
          />

        </div>


        {/* LOCATION RESULTS */}

        {districtId && (

          <div className="mt-3 max-h-64 overflow-y-auto rounded-xl border border-slate-200">

            {locationsLoading ? (

              <div className="p-4 text-sm text-slate-500">
                Searching locations...
              </div>

            ) : locations.length === 0 ? (

              <div className="p-4 text-sm text-slate-500">
                No location found.
              </div>

            ) : (

              locations.map((location) => (

                <button
                  key={location.id}
                  type="button"
                  onClick={() =>
                    setLocationId(
                      String(location.id)
                    )
                  }
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${
                    String(location.id) ===
                    String(locationId)
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-slate-50"
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <p className="font-semibold">
                      {location.name}
                    </p>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase text-slate-500">
                      {location.type}
                    </span>

                  </div>

                </button>

              ))

            )}

          </div>

        )}


        {/* CURRENT LOCATION */}

        {currentLocation?.city &&
          currentLocation?.state && (

            <div className="mt-5 rounded-xl bg-indigo-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wide text-indigo-500">
                Current Location
              </p>

              <p className="mt-1 font-bold text-slate-800">
                📍 {currentLocation.city},{" "}
                {currentLocation.state}
              </p>

            </div>

          )}


        {/* BUTTONS */}

        <div className="mt-7 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex-1 rounded-xl border border-slate-200 py-3 font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={
              saving ||
              !stateId ||
              !districtId ||
              !locationId
            }
            className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save Location"}
          </button>

        </div>

      </div>

    </div>
  );
}

export default LocationSelector;
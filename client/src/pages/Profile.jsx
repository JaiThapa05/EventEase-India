import { useEffect, useState } from "react";

function Profile() {
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    bio: ""
  });

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ========================================
  // GET PROFILE
  // ========================================

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage("Please login first.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        "https://eventease-india.onrender.com/api/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to load profile");
        return;
      }

      setProfile(data);

      setFormData({
        name: data.name || "",
        phone: data.phone || "",
        bio: data.bio || ""
      });

      setPreviewPhoto(data.profile_photo || "");

    } catch (error) {
      console.error("PROFILE ERROR:", error);
      setMessage("Unable to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ========================================
  // PHOTO SELECT
  // ========================================

  const handlePhotoChange = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setMessage("Please select an image file.");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    setMessage("Image size should be less than 5MB.");
    return;
  }

  setPreviewPhoto(URL.createObjectURL(file));

  const token = localStorage.getItem("token");

  const data = new FormData();
  data.append("profile_photo", file);

  try {
    setMessage("Uploading photo...");

    const response = await fetch(
      "https://eventease-india.onrender.com/api/profile/photo",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: data
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.message || "Failed to upload photo");
      return;
    }

    setPreviewPhoto(result.profile_photo);

    setProfile((prev) => ({
      ...prev,
      profile_photo: result.profile_photo
    }));

    const user = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    user.profile_photo = result.profile_photo;

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    setMessage("✅ Profile photo updated successfully!");

  } catch (error) {
    console.error("PHOTO UPLOAD ERROR:", error);
    setMessage("Failed to upload profile photo.");
  }
};

  // ========================================
  // UPDATE PROFILE
  // ========================================

  const handlePhotoUpload = async (e) => {

  const file = e.target.files[0];

  if (!file) return;

  const token = localStorage.getItem("token");

  const data = new FormData();

  data.append("profile_photo", file);

  try {

    setMessage("");

    const response = await fetch(
      "https://eventease-india.onrender.com/api/profile/photo",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${token}`
        },

        body: data
      }
    );

    const result = await response.json();

    if (!response.ok) {
      setMessage(
        result.message ||
        "Failed to upload photo"
      );
      return;
    }

    setMessage(
      "✅ Profile photo updated successfully!"
    );

    fetchProfile();

    // Update navbar user data
    const user =
      JSON.parse(
        localStorage.getItem("user") || "{}"
      );

    user.profile_photo =
      result.profile_photo;

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

  } catch (error) {

    console.error(
      "PHOTO UPLOAD ERROR:",
      error
    );

    setMessage(
      "Failed to upload profile photo."
    );
  }
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    setSaving(true);
    setMessage("");

    const token = localStorage.getItem("token");

    const response = await fetch(
      "https://eventease-india.onrender.com/api/profile",
      {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },

        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio
        })
      }
    );

    const data = await response.json();

    console.log("PROFILE UPDATE STATUS:", response.status);
    console.log("PROFILE UPDATE DATA:", data);

    if (!response.ok) {
      setMessage(
        `❌ ${data.message || "Failed to update profile"}`
      );
      return;
    }

    setMessage("✅ Profile updated successfully!");

    // Reload latest profile
    await fetchProfile();

    // Update localStorage user
    const oldUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    const updatedUser = {
      ...oldUser,
      name: formData.name
    };

    localStorage.setItem(
      "user",
      JSON.stringify(updatedUser)
    );

  } catch (error) {

    console.error("UPDATE PROFILE ERROR:", error);

    setMessage(
      "❌ Unable to update profile. Please try again."
    );

  } finally {

    setSaving(false);

  }
};

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">

        <h2 className="text-2xl font-bold text-indigo-600">
          Loading profile...
        </h2>

      </div>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <section className="bg-slate-950 text-white">

        <div className="max-w-5xl mx-auto px-6 py-14">

          <p className="text-indigo-400 font-bold">
            ACCOUNT
          </p>

          <h1 className="text-4xl md:text-5xl font-black mt-2">
            My Profile
          </h1>

          <p className="text-slate-300 mt-3">
            Manage your personal information.
          </p>

        </div>

      </section>


      {/* PROFILE */}

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* MESSAGE */}

        {message && (
          <div className="mb-6 rounded-xl bg-indigo-50 border border-indigo-100 p-4 text-indigo-700 font-semibold">
            {message}
          </div>
        )}


        <div className="grid md:grid-cols-3 gap-7">

          {/* ========================================
              PROFILE CARD
          ======================================== */}

          <div className="bg-white rounded-3xl border shadow-sm p-8 text-center">

            {/* PROFILE PHOTO */}

            {previewPhoto ? (

              <img
                src={
                    previewPhoto.startsWith("http")
                    ? previewPhoto
                    : `https://eventease-india.onrender.com${previewPhoto}`
                }
                alt={profile?.name || "Profile"}
                className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-indigo-100"
              />

            ) : (

              <div className="w-32 h-32 rounded-full bg-indigo-100 flex items-center justify-center mx-auto text-5xl font-black text-indigo-600">

                {profile?.name
                  ?.charAt(0)
                  ?.toUpperCase() || "U"}

              </div>

            )}


            {/* UPLOAD BUTTON */}

            <label className="inline-block mt-5 cursor-pointer rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700">

              📷 Change Photo

              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />

            </label>


            <p className="text-xs text-slate-400 mt-2">
              JPG, PNG or WEBP • Max 5MB
            </p>


            {/* NAME */}

            <h2 className="text-2xl font-black text-slate-900 mt-6">
              {profile?.name}
            </h2>


            {/* EMAIL */}

            <p className="text-slate-500 mt-1">
              {profile?.email}
            </p>


            {/* ROLE */}

            <span className="inline-block mt-4 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold capitalize">

              {profile?.role}

            </span>

          </div>


          {/* ========================================
              EDIT FORM
          ======================================== */}

          <div className="md:col-span-2 bg-white rounded-3xl border shadow-sm p-8">

            <h2 className="text-2xl font-black text-slate-900">
              Edit Profile
            </h2>


            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >

              {/* NAME */}

              <div>

                <label className="block font-bold text-slate-700 mb-2">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />

              </div>


              {/* EMAIL */}

              <div>

                <label className="block font-bold text-slate-700 mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-slate-500"
                />

              </div>


              {/* PHONE */}

              <div>

                <label className="block font-bold text-slate-700 mb-2">
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>


              {/* BIO */}

              <div>

                <label className="block font-bold text-slate-700 mb-2">
                  Bio
                </label>

                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us about yourself..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
                />

              </div>


              {/* SAVE */}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >

                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>

            </form>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Profile;
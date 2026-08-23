import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSending(true);
      setStatus("");

      const response = await fetch(
        "https://eventease-india.onrender.com/api/contact",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      console.log("CONTACT STATUS:", response.status);
      console.log("CONTACT RESPONSE:", data);

      if (!response.ok) {
        setStatus(
          `❌ ${data.message || "Failed to send message"}`
        );
        return;
      }

      setStatus("✅ Message sent successfully!");

      setFormData({
        name: "",
        email: "",
        message: ""
      });

    } catch (error) {
      console.error("CONTACT ERROR:", error);

      setStatus(
        "❌ Unable to send message. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-[80vh] bg-slate-50">

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950 px-5 py-20">

        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />

        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-600/30 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-indigo-400">
            Get in touch
          </p>

          <h1 className="mt-4 text-4xl font-black text-white md:text-5xl">
            We'd love to hear from you
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Have a question about an event or want to organize
            your own event? Send us a message.
          </p>

        </div>

      </section>

      {/* CONTACT CONTENT */}
      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-16 md:grid-cols-2">

        {/* LEFT */}
        <div>

          <h2 className="text-2xl font-black text-slate-900">
            Contact EventEase
          </h2>

          <p className="mt-3 leading-7 text-slate-500">
            We are here to help event organizers and participants
            have a smooth experience.
          </p>

          <div className="mt-8 space-y-4">

            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                📧
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Email
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  upcomingevent00@gmail.com
                </p>
              </div>

            </div>

            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                📍
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Location
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  India
                </p>
              </div>

            </div>

            <div className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100">
                🕐
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Support Hours
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Monday – Friday · 9 AM – 6 PM
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* FORM */}
        <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

          <h2 className="text-xl font-black text-slate-900">
            Send us a message
          </h2>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >

            {/* NAME */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Your Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />

            </div>

            {/* EMAIL */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />

            </div>

            {/* MESSAGE */}
            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Message
              </label>

              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                placeholder="How can we help?"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                required
              />

            </div>

            {/* STATUS MESSAGE */}
            {status && (
              <div
                className={`rounded-xl p-4 text-center font-semibold ${
                  status.startsWith("✅")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {status}
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-xl bg-indigo-600 py-3.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {sending ? "Sending..." : "Send Message →"}
            </button>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Contact;
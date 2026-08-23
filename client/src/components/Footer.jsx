function Footer() {
  return (
    <footer className="bg-slate-950 text-white">

      <div className="mx-auto max-w-7xl px-5 py-14">

        <div className="grid gap-10 md:grid-cols-4">

          {/* BRAND */}

          <div className="md:col-span-2">

            <div className="flex items-center gap-2">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600">
                🎫
              </div>

              <h2 className="text-xl font-extrabold">
                Event<span className="text-indigo-400">Ease</span>
              </h2>

            </div>

            <p className="mt-5 max-w-md leading-7 text-slate-400">
              Your one-stop platform to discover, register
              and organize events happening across India.
            </p>

          </div>


          {/* EXPLORE */}

          <div>

            <h3 className="font-bold">
              Explore
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-400">

              <p>Technology Events</p>
              <p>Education Events</p>
              <p>Business Events</p>
              <p>Sports Events</p>

            </div>

          </div>


          {/* PLATFORM */}

          <div>

            <h3 className="font-bold">
              Platform
            </h3>

            <div className="mt-4 space-y-3 text-sm text-slate-400">

              <p>Find Events</p>
              <p>Organize Events</p>
              <p>Register</p>
              <p>Contact Us</p>

            </div>

          </div>

        </div>


        <div className="mt-12 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
          © 2026 EventEase India · Built with ❤️ for event communities
        </div>

      </div>

    </footer>
  );
}

export default Footer;
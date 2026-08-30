import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const token = sessionStorage.getItem("token");

  const user = JSON.parse(
    sessionStorage.getItem("user") || "null"
  );

  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setMenuOpen(false);

    navigate("/login");

    window.location.reload();
  };

  // ========================================
  // CLOSE MOBILE MENU
  // ========================================

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

      {/* ========================================
          NAVBAR CONTAINER
      ======================================== */}

      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">


        {/* ========================================
            LOGO
        ======================================== */}

        <Link
          to="/"
          onClick={closeMenu}
          className="flex shrink-0 items-center gap-2.5"
        >

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg shadow-md sm:h-11 sm:w-11 sm:text-xl">
            🎟️
          </div>

          <div className="leading-none">

            <h1 className="text-lg font-black text-slate-900 sm:text-xl">
              EventEase
            </h1>

            <p className="mt-1 text-[10px] font-bold tracking-widest text-indigo-600 sm:text-xs">
              INDIA
            </p>

          </div>

        </Link>


        {/* ========================================
            DESKTOP NAVIGATION
        ======================================== */}

        <div className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:gap-7">

          {/* HOME */}

          <Link
            to="/"
            className="whitespace-nowrap rounded-lg px-2 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            Home
          </Link>


          {/* EVENTS */}

          <Link
            to="/events"
            className="whitespace-nowrap rounded-lg px-2 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            Events
          </Link>


          {/* CALENDAR */}

          <Link
            to="/calendar"
            className="whitespace-nowrap rounded-lg px-2 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            Calendar
          </Link>


          {/* ORGANIZER */}

          {token && user?.role === "organizer" && (
            <>

              <Link
                to="/create-event"
                className="whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2.5 font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
              >
                + Create Event
              </Link>

              <Link
                to="/organizer-dashboard"
                className="whitespace-nowrap rounded-lg px-2 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                Dashboard
              </Link>

            </>
          )}


          {/* MY EVENTS */}

          {token && (
            <Link
              to="/my-events"
              className="whitespace-nowrap rounded-lg px-2 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
            >
              My Events
            </Link>
          )}


          {/* CONTACT */}

          <Link
            to="/contact"
            className="whitespace-nowrap rounded-lg px-2 py-2 font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-600"
          >
            Contact
          </Link>


          {/* NOTIFICATIONS */}

          {token && (
            <Link
              to="/notifications"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-lg transition hover:bg-indigo-50 hover:text-indigo-600"
              title="Notifications"
            >
              🔔
            </Link>
          )}

        </div>


        {/* ========================================
            DESKTOP AUTH
        ======================================== */}

        <div className="hidden items-center gap-3 lg:flex">

          {!token ? (

            <>
              <Link
                to="/login"
                className="whitespace-nowrap rounded-xl px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-100 hover:text-indigo-600"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="whitespace-nowrap rounded-xl bg-slate-900 px-5 py-2.5 font-bold text-white transition hover:bg-slate-800"
              >
                Register
              </Link>
            </>

          ) : (

            <>

              {/* PROFILE */}

              <Link
                to="/profile"
                className="flex max-w-[150px] items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-slate-100"
              >

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>

                <div className="min-w-0">

                  <p className="truncate text-sm font-bold text-slate-800">
                    {user?.name || "User"}
                  </p>

                  <p
                    className={`text-xs capitalize ${
                      user?.role === "organizer"
                        ? "font-semibold text-indigo-600"
                        : "text-slate-400"
                    }`}
                  >
                    {user?.role || "participant"}
                  </p>

                </div>

              </Link>


              {/* LOGOUT */}

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-200 px-4 py-2.5 font-bold text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>

            </>

          )}

        </div>


        {/* ========================================
            MOBILE MENU BUTTON
        ======================================== */}

        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 lg:hidden"
        >

          {menuOpen ? "✕" : "☰"}

        </button>

      </div>


      {/* ========================================
          MOBILE MENU
      ======================================== */}

      {menuOpen && (

        <div className="border-t border-slate-200 bg-white shadow-lg lg:hidden">

          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">


            {/* ========================================
                MOBILE NAV LINKS
            ======================================== */}

            <div className="flex flex-col gap-1">


              {/* HOME */}

              <Link
                to="/"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                🏠 Home
              </Link>


              {/* EVENTS */}

              <Link
                to="/events"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                🎉 Events
              </Link>


              {/* CALENDAR */}

              <Link
                to="/calendar"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                📅 Calendar
              </Link>


              {/* MY EVENTS */}

              {token && (
                <Link
                  to="/my-events"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  🎟️ My Events
                </Link>
              )}


              {/* CONTACT */}

              <Link
                to="/contact"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
              >
                📞 Contact
              </Link>


              {/* NOTIFICATIONS */}

              {token && (
                <Link
                  to="/notifications"
                  onClick={closeMenu}
                  className="rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                >
                  🔔 Notifications
                </Link>
              )}


              {/* ========================================
                  ORGANIZER
              ======================================== */}

              {token && user?.role === "organizer" && (
                <div className="mt-2 border-t border-slate-100 pt-3">

                  <p className="px-4 pb-2 text-xs font-black uppercase tracking-widest text-slate-400">
                    Organizer
                  </p>


                  <Link
                    to="/create-event"
                    onClick={closeMenu}
                    className="flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-3.5 font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
                  >
                    + Create Event
                  </Link>


                  <Link
                    to="/organizer-dashboard"
                    onClick={closeMenu}
                    className="mt-2 block rounded-xl px-4 py-3.5 font-semibold text-slate-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                  >
                    📊 Organizer Dashboard
                  </Link>

                </div>
              )}


              {/* ========================================
                  NOT LOGGED IN
              ======================================== */}

              {!token && (

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">

                  <Link
                    to="/login"
                    onClick={closeMenu}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-center font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    Login
                  </Link>


                  <Link
                    to="/register"
                    onClick={closeMenu}
                    className="rounded-xl bg-slate-900 px-4 py-3 text-center font-bold text-white transition hover:bg-slate-800"
                  >
                    Register
                  </Link>

                </div>

              )}


              {/* ========================================
                  LOGGED IN USER
              ======================================== */}

              {token && (

                <div className="mt-3 border-t border-slate-100 pt-4">

                  {/* PROFILE */}

                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100"
                  >

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-black text-indigo-600">
                      {user?.name
                        ?.charAt(0)
                        ?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0">

                      <p className="truncate font-bold text-slate-900">
                        {user?.name || "User"}
                      </p>

                      <p
                        className={`text-sm capitalize ${
                          user?.role === "organizer"
                            ? "font-semibold text-indigo-600"
                            : "text-slate-400"
                        }`}
                      >
                        {user?.role || "participant"}
                      </p>

                    </div>

                    <span className="ml-auto text-slate-400">
                      →
                    </span>

                  </Link>


                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-3 w-full rounded-xl border border-red-200 px-4 py-3.5 font-bold text-red-600 transition hover:bg-red-50"
                  >
                    🚪 Logout
                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </nav>
  );
}

export default Navbar;
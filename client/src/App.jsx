import { BrowserRouter, Routes, Route } from "react-router-dom";
import LocationPermissionModal from "./components/LocationPermissionModal";
import Navbar from "./components/Navbar";


import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import CreateEvent from "./pages/CreateEvent";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import MyEvents from "./pages/MyEvents";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import EditEvent from "./pages/EditEvent";
import Calendar from "./pages/Calendar";
import Participants from "./pages/Participants";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";

function App() {
  return (
    <BrowserRouter>

      {/* NAVBAR */}

      <Navbar />


      {/* LOCATION PERMISSION POPUP */}

      <LocationPermissionModal /> 


      {/* ROUTES */}

      <Routes>

        {/* ========================================
            HOME
        ======================================== */}

        <Route
          path="/"
          element={<Home />}
        />


        {/* ========================================
            EVENTS
        ======================================== */}

        <Route
          path="/events"
          element={<Events />}
        />

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />


        {/* ========================================
            CREATE EVENT
        ======================================== */}

        <Route
          path="/create-event"
          element={<CreateEvent />}
        />


        {/* ========================================
            AUTH
        ======================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ========================================
            CONTACT
        ======================================== */}

        <Route
          path="/contact"
          element={<Contact />}
        />


        {/* ========================================
            MY EVENTS
        ======================================== */}

        <Route
          path="/my-events"
          element={<MyEvents />}
        />


        {/* ========================================
            ORGANIZER DASHBOARD
        ======================================== */}

        <Route
          path="/organizer-dashboard"
          element={<OrganizerDashboard />}
        />


        {/* ========================================
            EDIT EVENT
        ======================================== */}

        <Route
          path="/edit-event/:id"
          element={<EditEvent />}
        />


        {/* ========================================
            CALENDAR
        ======================================== */}

        <Route
          path="/calendar"
          element={<Calendar />}
        />


        {/* ========================================
            PARTICIPANTS
        ======================================== */}

        <Route
          path="/participants/:id"
          element={<Participants />}
        />


        {/* ========================================
            NOTIFICATIONS
        ======================================== */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />


        {/* ========================================
            PROFILE
        ======================================== */}

        <Route
          path="/profile"
          element={<Profile />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;
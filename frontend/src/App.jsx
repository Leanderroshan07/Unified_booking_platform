import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/dashboard/Dashboard";
import Flights from "./pages/flights/Flights";
import Trains from "./pages/trains/Trains";
import FlightDetails from "./pages/flights/FlightDetails";
import FlightPayment from "./pages/flights/FlightPayment";
import FlightBookingSuccess from "./pages/flights/FlightBookingSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import Movies from "./pages/movies/Movies";
import MovieDetails from "./pages/movies/MovieDetails";
import AdminMovies from "./pages/admin/AdminMovies";
import Booking from "./pages/movies/Booking";
import Payment from "./pages/movies/Payment";
import LandingPage from "./pages/LandingPage";
import AdminPanel from "./pages/admin/AdminPanel";
import HotelDetails from "./pages/HotelDetails";
import HotelPayment from "./pages/hotels/HotelPayment";
import HotelBookingSuccess from "./pages/hotels/HotelBookingSuccess";
import Buses from "./pages/buses/Buses";
import BusDetails from "./pages/buses/BusDetails";
import BusPayment from "./pages/buses/BusPayment";
import BusBookingSuccess from "./pages/buses/BusBookingSuccess";
import AdminBuses from "./pages/admin/AdminBuses";
import AdminTrains from "./pages/admin/AdminTrains";
import TrainDetails from "./pages/trains/TrainDetails";
import TrainPayment from "./pages/trains/TrainPayment";
import TrainBookingSuccess from "./pages/trains/TrainBookingSuccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/hotels" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flights"
          element={
            <ProtectedRoute>
              <Flights />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trains"
          element={
            <ProtectedRoute>
              <Trains />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trains/:id"
          element={
            <ProtectedRoute>
              <TrainDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/train-payment"
          element={
            <ProtectedRoute>
              <TrainPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/train-booking-success"
          element={
            <ProtectedRoute>
              <TrainBookingSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buses"
          element={
            <ProtectedRoute>
              <Buses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buses/:id"
          element={
            <ProtectedRoute>
              <BusDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flights/:id"
          element={
            <ProtectedRoute>
              <FlightDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/movies"
          element={
            <ProtectedRoute>
              <Movies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/movies/:id"
          element={
            <ProtectedRoute>
              <MovieDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/movies"
          element={
            <ProtectedRoute>
              <AdminMovies />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/hotels"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/hotels/:hotelId/rooms"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/buses"
          element={
            <ProtectedRoute>
              <AdminBuses />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/trains"
          element={
            <ProtectedRoute>
              <AdminTrains />
            </ProtectedRoute>
          }
        />

        <Route path="/hotels/:id" element={<HotelDetails />} />

        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel-payment"
          element={
            <ProtectedRoute>
              <HotelPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flight-payment"
          element={
            <ProtectedRoute>
              <FlightPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bus-payment"
          element={
            <ProtectedRoute>
              <BusPayment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/hotel-booking-success"
          element={
            <ProtectedRoute>
              <HotelBookingSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/flight-booking-success"
          element={
            <ProtectedRoute>
              <FlightBookingSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/bus-booking-success"
          element={
            <ProtectedRoute>
              <BusBookingSuccess />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

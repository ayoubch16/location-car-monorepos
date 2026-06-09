import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import CarsPage from "./pages/CarsPage";
import LoginPage from "./pages/LoginPage";
import ReservationPage from "./pages/ReservationPage";
import MesReservationsPage from "./pages/MesReservationsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CarsPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="reservation" element={<ReservationPage />} />
            <Route path="mes-reservations" element={<MesReservationsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

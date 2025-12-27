import { Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "../contexts/AdminAuthContext";
import { AdminAuth } from "./AdminAuth";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import CreateMatch from "../pages/admin/CreateMatch";
import CurrentBookings from "../pages/admin/CurrentBookings";
import MatchResults from "../pages/admin/MatchResults";
import Notifications from "../pages/admin/Notifications";
import Refunds from "../pages/admin/Refunds";
import Players from "../pages/admin/Players";
import Logs from "../pages/admin/Logs";
import AdminVenues from "../pages/admin/Venues";
import ExcelManager from "../pages/admin/ExcelManager";
// import Chat from "../pages/admin/Chat"; // Отключено - теперь используется прямой чат в Telegram

export function AdminRoutes() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="/" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <AdminDashboard />
          </AdminAuth>
        } />
        <Route path="/matches/create" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <CreateMatch />
          </AdminAuth>
        } />
        <Route path="/bookings" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <CurrentBookings />
          </AdminAuth>
        } />
        <Route path="/match-results" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <MatchResults />
          </AdminAuth>
        } />
        <Route path="/notifications" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <Notifications />
          </AdminAuth>
        } />
        <Route path="/refunds" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <Refunds />
          </AdminAuth>
        } />
        <Route path="/players" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <Players />
          </AdminAuth>
        } />
        <Route path="/venues" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <AdminVenues />
          </AdminAuth>
        } />
        <Route path="/logs" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <Logs />
          </AdminAuth>
        } />
        <Route path="/excel" element={
          <AdminAuth onAuthSuccess={() => {}}>
            <ExcelManager />
          </AdminAuth>
        } />

      </Routes>
    </AdminAuthProvider>
  );
}
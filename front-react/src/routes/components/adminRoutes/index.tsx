import { Navigate, Route, Routes } from "react-router";
import { E_ROUTES } from "enums";
import {
  Alerts,
  Avatars,
  Badges,
  BarChart,
  BasicTables,
  Blank,
  Buttons,
  Calendar,
  Videos,
  FormElements,
  Home,
  Images,
  LineChart,
  UserProfiles,
  UsersPage,
  VoituresPage,
  LocationsPage,
  PaiementsPage,
} from "pages";
import { AppLayout } from "layouts";

export function AdminRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index path={E_ROUTES.HOME} element={<Home />} />

        {/* Car rental */}
        <Route path={E_ROUTES.VOITURES} element={<VoituresPage />} />
        <Route path={E_ROUTES.LOCATIONS} element={<LocationsPage />} />
        <Route path={E_ROUTES.PAIEMENTS} element={<PaiementsPage />} />
        <Route path={E_ROUTES.USERS} element={<UsersPage />} />

        {/* Others */}
        <Route path="/profile" element={<UserProfiles />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/blank" element={<Blank />} />
        <Route path="/form-elements" element={<FormElements />} />
        <Route path="/basic-tables" element={<BasicTables />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/avatars" element={<Avatars />} />
        <Route path="/badge" element={<Badges />} />
        <Route path="/buttons" element={<Buttons />} />
        <Route path="/images" element={<Images />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/line-chart" element={<LineChart />} />
        <Route path="/bar-chart" element={<BarChart />} />

        <Route
          path={E_ROUTES.ANY}
          element={<Navigate to={E_ROUTES.HOME} replace />}
        />
      </Route>
    </Routes>
  );
}

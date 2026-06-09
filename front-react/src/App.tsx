//routes
import { AppRoutes } from "routes";
import { hydrateLanguage } from "core";
import { Toaster } from "react-hot-toast";

//reactQuery
import { APIProvider } from "api";
import { hydrateAuthCookie, useAuthCookie } from "core";
//loading
import { LoadingPage } from "pages";
//
import { AppWrapper } from "components";
import { ThemeProvider } from "context";
//
import "./index.css";
import "swiper/swiper-bundle.css";
import "flatpickr/dist/flatpickr.css";
// import i18n (needs to be bundled ;))
import "./i18n";
//hydration auth
hydrateAuthCookie();
hydrateLanguage();
//after set react query

export default function App() {
  const { status } = useAuthCookie();
  return (
    <APIProvider>
      <ThemeProvider>
        <AppWrapper>
          <Toaster
            position="top-right"
            containerStyle={{ zIndex: 999999 }}
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "10px",
                fontSize: "14px",
              },
            }}
          />
          {status === "idle" ? <LoadingPage /> : <AppRoutes />}
        </AppWrapper>
      </ThemeProvider>
    </APIProvider>
  );
}

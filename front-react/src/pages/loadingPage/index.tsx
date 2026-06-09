import { GridShape, PageMeta, ThemeTogglerTwo } from "components";
import { LOGO_DARK, LOGO_LIGHT } from "data";
import { useTheme } from "context";
import Loading from "assets/animations/loading.json";
import Lottie from "lottie-react";

export function LoadingPage() {
  const { theme } = useTheme();
  return (
    <div>
      <PageMeta
        title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />

      <div className="min-h-screen flex items-center justify-center  border border-gray-200  px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <GridShape />
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
        <div className="mx-auto  max-w-[630px] text-center flex-column items-center justify-center">
          <img width={400} height={60} src={"/images/favicon.png"} alt="Logo" />
          <div className="w-full flex items-center justify-center">
            <div className="max-w-[200px] ">
              <Lottie animationData={Loading} loop={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import Lottie from "lottie-react";
import Loading from "assets/animations/loading.json";

export function TableLoader() {
  return (
    <div className="flex items-center w-full justify-center py-8">
      <div className="w-20">
        <Lottie animationData={Loading} loop={true} />
      </div>
    </div>
  );
}

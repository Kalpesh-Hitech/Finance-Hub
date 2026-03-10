import { ClipLoader } from "react-spinners";

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-50">
      <ClipLoader size={45} color="#6366f1" />
    </div>
  );
};

export default PageLoader;

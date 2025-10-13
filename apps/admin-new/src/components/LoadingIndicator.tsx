// import { Loader } from "lucide-react";
import React from "react";

function LoadingIndicator() {
  // Insert the loading status check wherever this function is called.
  const status = "loading"; // Ideally, 'status' should be passed as a prop or derived from state/context

  // Display loading indicator when status is 'loading'
  if (status === "loading") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
        <p className="mt-2 text-sm text-gray-500">Loading, please wait...</p>
      </div>
    );
  }

  // Optionally, return null or some other content when not loading
  return null;
}

export default LoadingIndicator;

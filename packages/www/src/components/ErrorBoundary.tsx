import { ErrorRouteComponent } from "@tanstack/react-router";
import { useEffect } from "react";

export const ErrorBoundary: ErrorRouteComponent = (props) => {
  useEffect(() => {
    if (props.error) {
      console.error("app crashed", props.error);
    }
  }, [props.error]);

  return (
    <div className="h-full grid place-items-center p-2">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Error</h1>
        <p className="mb-5 text-muted">
          Oops, something went wrong. Please try again later.
        </p>
      </div>
    </div>
  );
};

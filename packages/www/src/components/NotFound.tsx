import { Link } from "@tanstack/react-router";

export function NotFound() {
  return (
    <div className="h-full grid place-items-center p-2">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mb-5 text-muted">
          The page you are looking for does not exist.
        </p>
        <Link className="px-4 py-2 bg-brand rounded-md text-black" to="/">
          Go to Home
        </Link>
      </div>
    </div>
  );
}

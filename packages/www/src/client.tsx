// src/client.tsx
import { StartClient } from "@tanstack/react-start";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

const router = createRouter();

router.subscribe("onBeforeLoad", ({ fromLocation, pathChanged }) => {
  console.log("route start");
  fromLocation && pathChanged && NProgress.start();
});
router.subscribe("onLoad", () => {
  console.log("route done");
  NProgress.done();
});

hydrateRoot(
  document,
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>,
);

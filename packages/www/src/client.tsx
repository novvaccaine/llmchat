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
  fromLocation && pathChanged && NProgress.start();
});
router.subscribe("onLoad", () => {
  NProgress.done();
});

hydrateRoot(
  document,
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>,
);

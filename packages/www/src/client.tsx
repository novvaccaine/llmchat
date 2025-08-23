// src/client.tsx
import { StartClient } from "@tanstack/react-start";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { createRouter } from "./router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useUIStore } from "./stores/uiStore";

NProgress.configure({ showSpinner: false });

const router = createRouter();
let nprogressTimer: ReturnType<typeof setTimeout>;

// only show the NProgress bar for route changes taking longer than 2 seconds
router.subscribe("onBeforeLoad", ({ fromLocation, pathChanged }) => {
  useUIStore.getState().closeDrawer();
  if (fromLocation && pathChanged) {
    nprogressTimer = setTimeout(() => {
      NProgress.start();
    }, 2000);
  }
});
router.subscribe("onLoad", () => {
  clearTimeout(nprogressTimer);
  NProgress.done();
});

hydrateRoot(
  document,
  <StrictMode>
    <StartClient router={router} />
  </StrictMode>,
);

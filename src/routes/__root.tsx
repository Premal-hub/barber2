import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow mb-6">404 — Off the Map</p>
        <h1 className="text-5xl md:text-7xl">Lost in the mirror.</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The page you're looking for has been rescheduled elsewhere.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center justify-center border border-primary/40 px-8 py-3 text-xs uppercase tracking-[0.28em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow mb-6">Interrupted</p>
        <h1 className="text-3xl">This page didn't load</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Something went wrong on our end. Try again or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="border border-primary/40 px-6 py-2.5 text-xs uppercase tracking-[0.28em] text-primary transition-all hover:bg-primary hover:text-primary-foreground"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-border px-6 py-2.5 text-xs uppercase tracking-[0.28em] text-foreground transition-all hover:border-primary/40"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#0a0a0a" },
      { title: "Barber Lab — Precision. Style. Confidence. | Pickering, ON" },
      { name: "description", content: "Barber Lab is Pickering's premier men's grooming studio. Master cuts, fades, hot-towel shaves and beard sculpting. Book with a specialist at 2060 Liverpool Rd." },
      { name: "author", content: "Barber Lab" },
      { property: "og:title", content: "Barber Lab — Precision. Style. Confidence." },
      { property: "og:description", content: "Pickering's premier men's grooming studio. Master cuts, fades, hot-towel shaves and beard sculpting." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Barber Lab" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Barber Lab — Precision. Style. Confidence." },
      { name: "twitter:description", content: "Pickering's premier men's grooming studio." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

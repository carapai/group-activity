import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    RouterProvider,
    createHashHistory,
    createRouter,
} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider";

import "./index.css";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient({
    defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 0 } },
});
const history = createHashHistory();
// Set up a Router instance
const router = createRouter({
    routeTree,
    context: {
        queryClient,
    },
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    history,
});

declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </ThemeProvider>
    );
}

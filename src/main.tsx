import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    RouterProvider,
    createRouter,
    createHashHistory,
} from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { routeTree } from "./routeTree.gen";
import "./index.css";

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

// Register things for typesafety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
    }
}

const rootElement = document.getElementById("root");

if (rootElement && !rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
        </QueryClientProvider>
    );
}

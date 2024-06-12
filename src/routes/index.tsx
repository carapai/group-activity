import { firstQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Home,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(firstQueryOptions),
});
function Home() {
    const { data } = useSuspenseQuery(firstQueryOptions);
    return (
        <Navigate
            to="/tracker/$program/instances"
            search={{ ou: data, registration: false }}
            params={{ program: "saYT7gxJCPm" }}
        />
    );
}

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
            search={{
                ou: data,
                page: 1,
                pageSize: 10,
                trackedEntityType: "jUBCsJonWQ2",
            }}
            params={{ program: "IXxHJADVCkb" }}
        />
    );
}

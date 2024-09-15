import { db } from "@/db";
import { initialQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    Outlet,
    useSearch,
} from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { z } from "zod";

export const Route = createFileRoute("/tracker")({
    component: TrackerComponent,
    validateSearch: z.object({
        ph: z.boolean().optional(),
    }),
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(initialQueryOptions),
});

function TrackerComponent() {
    const {
        data: { programs },
    } = useSuspenseQuery(initialQueryOptions);

    const ou = useLiveQuery(() => db.currentOu.where({ id: 1 }).first());
    const { ph } = useSearch({ from: Route.fullPath });

    if (ph === undefined || ph === false)
        return (
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={10}>
                    {programs.map(({ id, name, trackedEntityType }) => {
                        return (
                            <div key={id}>
                                <Link
                                    to="/tracker/$program/instances"
                                    className={`block py-2 px-3 text-blue-700`}
                                    activeProps={{ className: `font-bold` }}
                                    params={{ program: id }}
                                    search={{
                                        ou: ou?.value ?? "",
                                        page: 1,
                                        pageSize: 10,
                                        trackedEntityType:
                                            trackedEntityType?.id,
                                    }}
                                >
                                    {name}
                                </Link>
                            </div>
                        );
                    })}
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={90}>
                    <Outlet />
                </ResizablePanel>
            </ResizablePanelGroup>
        );
    return <Outlet />;
}

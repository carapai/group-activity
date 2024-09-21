import { initialQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    Outlet,
    useSearch,
} from "@tanstack/react-router";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { z } from "zod";
import { clean } from "@/utils/utils";

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
        data: { programs, ou },
    } = useSuspenseQuery(initialQueryOptions);

    const { ph } = useSearch({ from: Route.fullPath });

    if (ph === undefined || ph === false)
        return (
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={10}>
                    {programs.flatMap(({ id, name, trackedEntityType }) => {
                        if (["azl3du5TrAR", "IXxHJADVCkb"].indexOf(id) !== -1) {
                            return (
                                <div key={id}>
                                    <Link
                                        to="/tracker/$program/instances"
                                        className={`block py-2 px-3 text-blue-700`}
                                        activeProps={{
                                            className: `font-bold`,
                                        }}
                                        activeOptions={{
                                            exact: false,
                                        }}
                                        params={{
                                            program: id,
                                        }}
                                        search={{
                                            ou,
                                            page: 1,
                                            pageSize: 10,
                                            trackedEntityType:
                                                trackedEntityType?.id,
                                        }}
                                    >
                                        {clean(name)}
                                    </Link>
                                </div>
                            );
                        }
                        return [];
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

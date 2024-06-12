import { db } from "@/db";
import { initialQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useLiveQuery } from "dexie-react-hooks";

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";

export const Route = createFileRoute("/tracker")({
    component: TrackerComponent,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(initialQueryOptions),
});

function TrackerComponent() {
    const {
        data: { programs },
    } = useSuspenseQuery(initialQueryOptions);

    const ou = useLiveQuery(() => db.currentOu.where({ id: 1 }).first());

    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={10}>
                {programs
                    .filter(
                        ({ id }) =>
                            ["saYT7gxJCPm", "azl3du5TrAR"].indexOf(id) !== -1
                    )
                    .map(({ id, name, registration }) => {
                        return (
                            <div key={id}>
                                <Link
                                    to="/tracker/$program/instances"
                                    activeOptions={
                                        {
                                            // If the route points to the root of it's parent,
                                            // make sure it's only active if it's exact
                                            // exact: to === '.',
                                        }
                                    }
                                    preload="intent"
                                    className={`block py-2 px-3 text-blue-700`}
                                    // Make "active" links bold
                                    activeProps={{ className: `font-bold` }}
                                    params={{ program: id }}
                                    search={{
                                        ou: ou?.value ?? "",
                                        registration,
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
        // <div className={`flex-1 flex`}>
        //     <div className={`divide-y w-56 min-w-56`}>

        //     </div>
        //     <div className={`flex-1 border-gray-200 w-[calc(100vw-56rem)]`}>
        //         <Outlet />
        //     </div>
        // </div>
    );
}

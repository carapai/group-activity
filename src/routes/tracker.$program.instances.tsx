import TrackedEntities from "@/components/TrackedEntities";
import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { TrackerSearchSchema } from "@/schemas/search";
import { instancesQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Outlet,
    useLoaderData,
    useNavigate,
    useSearch,
} from "@tanstack/react-router";
import { memo, useMemo } from "react";
import useKeyboardShortcut from "use-keyboard-shortcut";

const MemoizedTrackedEntities = memo(TrackedEntities);

export const Route = createFileRoute("/tracker/$program/instances")({
    component: InstancesComponent,
    validateSearch: TrackerSearchSchema,
    loaderDeps: ({ search: { ou, page, pageSize } }) => ({
        ou,
        pageSize,
        page,
    }),
    loader: ({
        params: { program },
        context: { queryClient },
        deps: { ou, page, pageSize },
    }) =>
        queryClient.ensureQueryData(
            instancesQueryOptions({
                ou,
                program,
                page,
                pageSize,
            }),
        ),
    pendingComponent: () => <div>Loading...</div>,
});

function InstancesComponent() {
    const program = useLoaderData({
        from: "/tracker/$program",
    });
    const { ou, page, pageSize, th, selectedKeys } = useSearch({
        from: "/tracker/$program/instances",
    });
    const navigate = useNavigate({ from: "/tracker/$program" });

    const queryOptions = useMemo(
        () =>
            instancesQueryOptions({
                program: program.id,
                ou,
                page,
                pageSize,
            }),
        [program.id, ou, page, pageSize],
    );
    useSuspenseQuery(queryOptions);

    useKeyboardShortcut(
        ["Control", "O"],
        () => navigate({ search: (s) => ({ ...s, oh: !s.oh }) }),
        {
            overrideSystem: false,
            ignoreInputFields: false,
            repeatOnHold: true,
        },
    );

    if (th === undefined || th === false)
        return (
            <ResizablePanelGroup direction="horizontal" id="left-right">
                <ResizablePanel id="left">
                    <MemoizedTrackedEntities program={program} />
                </ResizablePanel>

                {selectedKeys && <ResizableHandle withHandle />}
                {selectedKeys && (
                    <ResizablePanel id="right">
                        <Outlet />
                    </ResizablePanel>
                )}
            </ResizablePanelGroup>
        );

    return <Outlet />;
}

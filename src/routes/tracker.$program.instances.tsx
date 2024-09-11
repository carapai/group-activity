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
import useKeyboardShortcut from "use-keyboard-shortcut";

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
    const { id } = useLoaderData({
        from: "/tracker/$program",
    });
    const { ou, page, pageSize, th, selectedKeys } = useSearch({
        from: "/tracker/$program/instances",
    });
    const navigate = useNavigate({ from: "/tracker/$program" });
    useSuspenseQuery(
        instancesQueryOptions({
            program: id,
            ou,
            page,
            pageSize,
        }),
    );

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
                    <TrackedEntities />
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

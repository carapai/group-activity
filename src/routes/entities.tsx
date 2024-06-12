import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from "@/components/ui/resizable";
import { EntitySearchSchema } from "@/schemas/search";
import { entityQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Link,
    Outlet,
    useSearch,
} from "@tanstack/react-router";

export const Route = createFileRoute("/entities")({
    component: EntitiesComponent,
    validateSearch: EntitySearchSchema,
    loaderDeps: ({ search: { tei, program } }) => ({ tei, program }),
    loader: ({ context: { queryClient }, deps: { tei, program } }) =>
        queryClient.ensureQueryData(entityQueryOptions({ tei, program })),
});

function EntitiesComponent() {
    const { tei, program, enrollment } = useSearch({ from: "/entities" });
    const { data } = useSuspenseQuery(entityQueryOptions({ tei, program }));
    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70}>
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={10}>
                        <div className="overflow-scroll h-full">
                            {data.programStages.map(({ name, id }) => (
                                <div key={id} className="p-2">
                                    <Link
                                        to="/entities/$stage"
                                        search={{
                                            enrollment,
                                            program,
                                            tei,
                                        }}
                                        params={{ stage: id }}
                                    >
                                        {name}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={90}>
                        <div className="overflow-scroll flex flex-1 h-full">
                            <Outlet />
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={30}>
                <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={25}>
                        <div className="flex h-full items-center justify-center p-6">
                            <span className="font-semibold">Two</span>
                        </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={75}>
                        <div className="flex h-full items-center justify-center p-6">
                            <span className="font-semibold">Three</span>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
}

import Events from "@/components/Events";
import TrackedEntities from "@/components/TrackedEntities";
import { DisplayInstance, EventDisplay } from "@/interfaces";
import { TrackerSearchSchema } from "@/schemas/search";
import { instancesQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useLoaderData,
    useSearch,
} from "@tanstack/react-router";

export const Route = createFileRoute("/tracker/$program/instances")({
    component: InstancesComponent,
    validateSearch: TrackerSearchSchema,
    loaderDeps: ({ search: { ou, registration } }) => ({ ou, registration }),
    loader: ({
        params: { program },
        context: { queryClient },
        deps: { ou, registration },
    }) =>
        queryClient.ensureQueryData(
            instancesQueryOptions({ ou, program, registration })
        ),
});

function InstancesComponent() {
    const { programTrackedEntityAttributes, programStages, id } = useLoaderData(
        {
            from: "/tracker/$program",
        }
    );
    const { ou, registration } = useSearch({
        from: "/tracker/$program/instances",
    });
    const { data } = useSuspenseQuery(
        instancesQueryOptions({ program: id, ou, registration })
    );

    if (registration)
        return (
            <TrackedEntities
                data={data as DisplayInstance[]}
                program={id}
                ou={ou}
                programTrackedEntityAttributes={programTrackedEntityAttributes}
            />
        );

    return (
        <Events
            data={data as EventDisplay[]}
            program={id}
            ou={ou}
            programStage={programStages[0]}
        />
    );
}

import { EventSearchSchema } from "@/schemas/search";
import { programStageQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/entities/$stage")({
    component: StageComponent,
    validateSearch: EventSearchSchema,
    loaderDeps: ({ search: { tei, enrollment, event, program } }) => ({
        tei,
        enrollment,
        event,
        program,
    }),
    loader: ({
        context: { queryClient },
        deps: { tei, enrollment, event, program },
        params: { stage },
    }) =>
        queryClient.ensureQueryData(
            programStageQueryOptions({
                tei,
                programStage: stage,
                enrollment,
                event,
                program,
            })
        ),
});

function StageComponent() {
    const { tei, enrollment, program, event } = useSearch({
        from: "/entities/$stage",
    });
    const { stage } = useParams({ from: "/entities/$stage" });

    const { data } = useSuspenseQuery(
        programStageQueryOptions({
            tei,
            programStage: stage,
            enrollment,
            event,
            program,
        })
    );

    return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

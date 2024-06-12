import EventForm from "@/components/EventForm";
import TrackedEntityForm from "@/components/TrackedEntityForm";
import { EventSearchSchema } from "@/schemas/search";
import { eventQueryOptions } from "@/utils/queryOptions";
import { createFileRoute, useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/tracker/$program/form")({
    validateSearch: EventSearchSchema,
    component: FormComponent,
    loaderDeps: ({ search: { event } }) => ({
        event,
    }),
    loader: ({ context: { queryClient }, deps: { event } }) =>
        queryClient.ensureQueryData(eventQueryOptions({ event: event ?? "" })),
});

function FormComponent() {
    const { registration } = useSearch({ from: Route.fullPath });

    if (registration) return <TrackedEntityForm />;

    return <EventForm />;
}

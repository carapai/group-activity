import ActivityDetails from "@/components/ActivityDetails";
import Beneficiaries from "@/components/Beneficiaries";
import TrackedEntity from "@/components/TrackedEntity";
import { EventSearchSchema } from "@/schemas/search";
import { trackedEntityQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useNavigate,
    useParams,
} from "@tanstack/react-router";

import useKeyboardShortcut from "use-keyboard-shortcut";

export const Route = createFileRoute(
    "/tracker/$program/instances/$trackedEntity",
)({
    component: TrackedEntityComponent,
    validateSearch: EventSearchSchema,
    loader: ({
        params: { program, trackedEntity },
        context: { queryClient },
    }) =>
        queryClient.ensureQueryData(
            trackedEntityQueryOptions({
                program,
                trackedEntity,
            }),
        ),
    pendingComponent: () => <div>Loading...</div>,
});

function TrackedEntityComponent() {
    const { program, trackedEntity } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });

    useSuspenseQuery(trackedEntityQueryOptions({ program, trackedEntity }));

    const navigate = useNavigate({ from: Route.fullPath });

    useKeyboardShortcut(
        ["Control", "T"],
        () => navigate({ search: (s) => ({ ...s, th: !s.th }) }),
        {
            overrideSystem: false,
            ignoreInputFields: false,
            repeatOnHold: true,
        },
    );

    if (program === "IXxHJADVCkb") return <ActivityDetails />;
    if (program === "azl3du5TrAR")
        return (
            <TrackedEntity
                additional={{
                    title: "Members",
                    component: (
                        <Beneficiaries
                            title="Add Members"
                            modalTitle="Adding Members"
                            currentIsFrom={false}
                            relationshipType="MKS09h3wi7J"
                        />
                    ),
                }}
            />
        );
    return <TrackedEntity />;
}

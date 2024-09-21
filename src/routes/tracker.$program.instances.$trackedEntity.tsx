import ActivityDetails from "@/components/ActivityDetails";
import Beneficiaries from "@/components/Beneficiaries";
import TrackedEntity from "@/components/TrackedEntity";
import { EventSearchSchema } from "@/schemas/search";
import { trackedEntityQueryOptions } from "@/utils/queryOptions";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";
import { Button } from "antd";

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

    const { th } = useSearch({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    useSuspenseQuery(trackedEntityQueryOptions({ program, trackedEntity }));

    const navigate = useNavigate({ from: Route.fullPath });

    return (
        <div className="flex flex-col gap-3">
            <Button
                onClick={() =>
                    navigate({ search: (s) => ({ ...s, th: !s.th }) })
                }
                type="text"
                icon={
                    th === undefined || th === false ? (
                        <LeftOutlined />
                    ) : (
                        <RightOutlined />
                    )
                }
            />
            {program === "IXxHJADVCkb" && <ActivityDetails />}
            {program === "azl3du5TrAR" && (
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
            )}
            {!["IXxHJADVCkb", "azl3du5TrAR"].includes(program) && (
                <TrackedEntity />
            )}
        </div>
    );
}

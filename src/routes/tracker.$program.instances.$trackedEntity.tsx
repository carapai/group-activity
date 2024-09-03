import ActivityDetails from "@/components/ActivityDetails";
import { EventDisplay } from "@/interfaces";
import { EventSearchSchema } from "@/schemas/search";
import { trackedEntityQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    useLoaderData,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { Table, Tabs } from "antd";

import type { TableProps } from "antd";
import { fromPairs, groupBy } from "lodash";
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
});

function TrackedEntityComponent() {
    const { programStages } = useLoaderData({
        from: "/tracker/$program",
    });
    const { trackedEntity, program } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const { data } = useSuspenseQuery(
        trackedEntityQueryOptions({
            program,
            trackedEntity,
        }),
    );

    const navigate = useNavigate({ from: Route.fullPath });

    const columns: Record<string, TableProps<EventDisplay>["columns"]> =
        fromPairs(
            programStages.map(({ id, programStageDataElements }) => [
                id,
                [
                    {
                        dataElement: {
                            id: "occurredAt",
                            formName: "Event Date",
                            name: "Event date",
                        },
                    },
                    ...programStageDataElements,
                ].map(({ dataElement: { id, formName, name } }) => ({
                    title: formName || name,
                    key: id,
                    render: (_, { values, occurredAt }) => {
                        return { ...values, occurredAt }[id];
                    },
                })),
            ]),
        );

    const allData = groupBy<EventDisplay>(
        data.enrollments.flatMap(({ events }) => {
            if (events) {
                return events.map((e) => ({
                    ...e,
                    values: e.dataValues
                        ? fromPairs(
                              e.dataValues.map((d) => [d.dataElement, d.value]),
                          )
                        : {},
                }));
            }
            return [];
        }),
        "programStage",
    );
    useKeyboardShortcut(
        ["Shift", "T"],
        () => navigate({ search: (s) => ({ ...s, th: !s.th }) }),
        {
            overrideSystem: false,
            ignoreInputFields: false,
            repeatOnHold: true,
        },
    );

    if (program === "IXxHJADVCkb") return <ActivityDetails />;
    return (
        <div className="p-2">
            <Tabs
                defaultActiveKey={programStages[0].id}
                tabPosition="top"
                items={programStages.map(({ name, id }) => {
                    return {
                        label: name,
                        key: id,
                        children: (
                            <div className="h-[700px] overflow-auto">
                                <Table
                                    columns={columns[id]}
                                    dataSource={allData[id]}
                                    rowKey="event"
                                    scroll={{ x: "max-content" }}
                                />
                            </div>
                        ),
                    };
                })}
            />
        </div>
    );
}

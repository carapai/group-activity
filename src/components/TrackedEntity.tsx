import { db } from "@/db";
import { EventDisplay } from "@/interfaces";
import { useLoaderData, useParams } from "@tanstack/react-router";
import { Table, Tabs } from "antd";
import type { TableProps } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import { Dictionary, fromPairs, groupBy } from "lodash";
import { useEffect, useState } from "react";

export default function TrackedEntity({
    additional,
}: {
    additional?: { title: string; component: JSX.Element };
}) {
    const { programStages } = useLoaderData({
        from: "/tracker/$program",
    });
    const { trackedEntity } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const instance = useLiveQuery(() => db.instances.get(trackedEntity));
    const [currentStage, setCurrentStage] = useState<string>(
        additional?.title ?? programStages[0].id,
    );

    const [allData, setAllData] = useState<Dictionary<EventDisplay[]>>(
        groupBy<EventDisplay>(
            instance?.enrollments?.flatMap(({ events }) => {
                if (events) {
                    return events.map((e) => ({
                        ...e,
                        values: e.dataValues
                            ? fromPairs(
                                  e.dataValues.map((d) => [
                                      d.dataElement,
                                      d.value,
                                  ]),
                              )
                            : {},
                    }));
                }
                return [];
            }),
            "programStage",
        ),
    );

    useEffect(() => {
        setAllData(
            groupBy<EventDisplay>(
                instance?.enrollments?.flatMap(({ events }) => {
                    if (events) {
                        return events.map((e) => ({
                            ...e,
                            values: e.dataValues
                                ? fromPairs(
                                      e.dataValues.map((d) => [
                                          d.dataElement,
                                          d.value,
                                      ]),
                                  )
                                : {},
                        }));
                    }
                    return [];
                }),
                "programStage",
            ),
        );
    }, [currentStage]);
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
    return (
        <div className="p-2">
            <Tabs
                tabPosition="top"
                activeKey={currentStage}
                onChange={(val) => setCurrentStage(() => val)}
                items={[
                    ...(additional?.title
                        ? [{ name: additional.title, id: additional.title }]
                        : []),
                    ...programStages,
                ].map(({ name, id }) => {
                    return {
                        label: name,
                        key: id,
                        children:
                            id === additional?.title ? (
                                additional.component
                            ) : (
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

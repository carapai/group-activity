import { DisplayInstance, EventDisplay } from "@/interfaces";
import { api } from "@/utils/dhis2";
import { generateUid } from "@/utils/uid";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Button, Checkbox, DatePicker, Modal, Table, Tabs } from "antd";

import type { DatePickerProps, TableProps } from "antd";

import { db } from "@/db";
import { availableSessionsQueryOptions } from "@/utils/queryOptions";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { columns } from "./columns";

const removeSession = async (
    sessionEvent: EventDisplay,
    sessionDateEvent: EventDisplay,
    session: string,
) => {
    const sessions = sessionEvent.dataValues?.filter(
        (dv) => dv.dataElement === "ygHFm67aRqZ",
    );
    if (sessions && sessions.length > 0) {
        const dataValues = sessionEvent.dataValues?.map((dataValue) => {
            if (dataValue.dataElement === "ygHFm67aRqZ") {
                return {
                    ...dataValue,
                    value: dataValue.value
                        ?.split(",")
                        .filter((s) => s !== session)
                        .join(","),
                };
            }
            return dataValue;
        });

        await db.sessions.put({
            ...sessionEvent,
            dataValues,
            values: {
                sessionDateEvent: sessionDateEvent.event ?? "",
            },
        });
    }
};

const addSession = async (
    session: string,
    sessionDateEvent: EventDisplay,
    attendee: DisplayInstance,
    sessionEvent?: EventDisplay,
) => {
    if (sessionEvent?.event) {
        const sessions = sessionEvent.dataValues?.filter(
            (dv) => dv.dataElement === "ygHFm67aRqZ",
        );
        if (sessions && sessions.length > 0) {
            const dataValues = sessionEvent.dataValues?.map((dataValue) => {
                if (dataValue.dataElement === "ygHFm67aRqZ") {
                    return {
                        ...dataValue,
                        value: [
                            ...(dataValue.value?.split(",") ?? []),
                            session,
                        ].join(","),
                    };
                }
                return dataValue;
            });
            await db.sessions.put({
                ...sessionEvent,
                dataValues,
                values: {
                    sessionDateEvent: sessionDateEvent.event ?? "",
                },
            });
        } else {
            await db.sessions.put({
                ...sessionEvent,
                dataValues: [
                    ...(sessionEvent.dataValues ?? []),
                    { dataElement: "ygHFm67aRqZ", value: session },
                ],
                values: {
                    sessionDateEvent: sessionDateEvent.event ?? "",
                },
            });
        }
    } else {
        const newSession = {
            event: generateUid(),
            trackedEntity: attendee.trackedEntity,
            enrollment: attendee.firstEnrollment,
            orgUnit: attendee.orgUnit,
            occurredAt: sessionDateEvent.occurredAt,
            programStage: "EVkAS8LJNbO",
            dataValues: [{ dataElement: "ygHFm67aRqZ", value: session }],
            values: { sessionDateEvent: sessionDateEvent.event ?? "" },
        };
        await db.sessions.put(newSession);
    }
};

function Attendance({
    session,
    attendee,
    sessionDateEvent,
}: {
    session: string;
    sessionDateEvent: EventDisplay;
    attendee: DisplayInstance;
}) {
    const attendance = useLiveQuery(
        () =>
            db.sessions
                .where({
                    trackedEntity: attendee.trackedEntity,
                })
                .first(),
        [session, sessionDateEvent.event, attendee.trackedEntity],
    );

    const attendedSessions =
        attendance?.dataValues
            ?.find((a) => a.dataElement === "ygHFm67aRqZ")
            ?.value?.split(",") ?? [];

    const toggleSession = async (add: boolean) => {
        if (add) {
            await addSession(session, sessionDateEvent, attendee, attendance);
        } else if (attendance && !add) {
            await removeSession(attendance, sessionDateEvent, session);
        }
    };
    return (
        <Checkbox
            checked={attendedSessions.includes(session)}
            onChange={(e) => toggleSession(e.target.checked)}
        />
    );
}

export default function Sessions() {
    const { trackedEntity, program } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });

    const instance = useLiveQuery(() => db.instances.get(trackedEntity));

    const activityDates = instance?.enrollments?.flatMap(({ events }) => {
        if (events) {
            return events.flatMap((e) => {
                if (e.programStage === "RN59JuJzecP") {
                    if (e.dataValues) {
                        return {
                            ...e,
                            values: e.dataValues.reduce<Record<string, string>>(
                                (acc, { dataElement, value }) => {
                                    if (dataElement && value) {
                                        acc[dataElement] = value;
                                    }
                                    return acc;
                                },
                                {},
                            ),
                        };
                    }
                    return {
                        ...e,
                        values: {},
                    };
                }
                return [];
            });
        }
        return [];
    });
    const participants = useLiveQuery(() => db.participants.toArray());

    const validSessions = instance?.attributes?.find(
        (a) => a.attribute === "mWyp85xIzXR",
    );
    const { data } = useSuspenseQuery(
        availableSessionsQueryOptions(validSessions?.value ?? ""),
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const disabledDate: DatePickerProps["disabledDate"] = (current) => {
        return current && current > dayjs().endOf("day");
    };

    const [occurredAt, setOccurredAt] = useState<dayjs.Dayjs | undefined>(
        undefined,
    );

    const sessionColumns: TableProps<EventDisplay>["columns"] = [
        {
            title: "Activity Date",
            dataIndex: "occurredAt",
            key: "occurredAt",
            render: (date) => dayjs(date).format("YYYY-MM-DD"),
        },
    ];

    const expandedRowRender = (record: EventDisplay) => {
        return (
            <Tabs
                items={validSessions?.value?.split(",").map((s) => {
                    const others = data[s] ?? [];
                    return {
                        label: s,
                        key: s,
                        children: (
                            <Table
                                columns={columns?.concat(
                                    others.map((a) => ({
                                        title: a.name,
                                        dataIndex: a.code,
                                        key: a.id,
                                        align: "center",
                                        render: (_, row) => {
                                            return (
                                                <Attendance
                                                    session={a.code}
                                                    sessionDateEvent={record}
                                                    attendee={row}
                                                />
                                            );
                                        },
                                    })),
                                )}
                                dataSource={participants}
                                rowKey="trackedEntity"
                                pagination={false}
                                bordered
                            />
                        ),
                    };
                })}
            />
        );
    };

    const handleOk = async () => {
        const event = {
            occurredAt: occurredAt?.format("YYYY-MM-DD"),
            event: generateUid(),
            program,
            programStage: "RN59JuJzecP",
            trackedEntity: trackedEntity,
            orgUnit: instance?.orgUnit,
            enrollment: instance?.firstEnrollment,
        };
        await api.post(
            "api/tracker",
            {
                events: [event],
            },
            { params: { async: false } },
        );
        const update = {
            ...instance,
            enrollments: instance?.enrollments?.map((e) => {
                return {
                    ...e,
                    events: e.events?.concat([event]),
                };
            }),
        };
        db.instances.put(update);
        setIsModalOpen(() => false);
    };

    const handleCancel = () => {
        setIsModalOpen(() => false);
    };

    return (
        <div className="h-[700px] overflow-auto flex flex-col gap-2">
            <div>
                <Button onClick={() => setIsModalOpen(() => true)}>
                    Add Session
                </Button>
            </div>
            <Table
                columns={sessionColumns}
                dataSource={activityDates}
                rowKey="event"
                pagination={false}
                expandable={{ expandedRowRender }}
                scroll={{ x: "max-content" }}
            />

            <Modal
                title="Individual Beneficiaries"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={400}
                footer={
                    <div className="flex flex-row gap-3 w-full">
                        <Button onClick={handleCancel}>Cancel</Button>
                        <Button type="primary" onClick={handleOk}>
                            OK
                        </Button>
                    </div>
                }
            >
                <div className="py-3">
                    <DatePicker
                        format="YYYY-MM-DD"
                        disabledDate={disabledDate}
                        className="w-full"
                        value={occurredAt}
                        onChange={(date) => setOccurredAt(date)}
                    />
                </div>
            </Modal>
        </div>
    );
}

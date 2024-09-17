import { DisplayInstance, EventDisplay } from "@/interfaces";
import { api } from "@/utils/dhis2";
import { generateUid } from "@/utils/uid";
import { useParams } from "@tanstack/react-router";
import { Button, Checkbox, DatePicker, Modal, Space, Table } from "antd";

import type { DatePickerProps, TableProps } from "antd";

import { db } from "@/db";
import { sessions } from "@/utils/queryOptions";
import dayjs from "dayjs";
import { useLiveQuery } from "dexie-react-hooks";
import { useEffect, useState } from "react";
import { columns } from "./columns";
import Dropdown from "./Dropdown";

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
    groupType?: string,
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
            programStage:
                attendee.program === "lMC8XN5Lanc"
                    ? "fTCSYlAqD2S"
                    : "EVkAS8LJNbO",
            program: attendee.program,
            dataValues: [
                { dataElement: "ygHFm67aRqZ", value: session },
                {
                    dataElement: "qgikW8oSfNe",
                    value: groupType,
                },
            ],
            values: { sessionDateEvent: sessionDateEvent.event ?? "" },
        };
        await db.sessions.put(newSession);
    }
};

function Attendance({
    session,
    attendee,
    sessionDateEvent,
    groupType,
}: {
    session: string;
    sessionDateEvent: EventDisplay;
    attendee: DisplayInstance;
    groupType?: string;
}) {
    const allAttendeeSessions = useLiveQuery(
        () =>
            db.sessions
                .where({
                    trackedEntity: attendee.trackedEntity,
                })
                .toArray(),
        [session, sessionDateEvent.event, attendee.trackedEntity],
    );

    const [attendedSessions, setAttendedSessions] = useState<string[]>([]);
    const [attendance, setAttendance] = useState<EventDisplay | undefined>(
        undefined,
    );

    useEffect(() => {
        if (allAttendeeSessions) {
            const attendedSession = allAttendeeSessions.find(
                ({ values }) =>
                    values.sessionDateEvent === sessionDateEvent.event,
            );
            if (attendedSession) {
                setAttendedSessions(
                    () =>
                        attendedSession.dataValues
                            ?.find((a) => a.dataElement === "ygHFm67aRqZ")
                            ?.value?.split(",") ?? [],
                );
                setAttendance(() => attendedSession);
            }
        }
    }, [allAttendeeSessions]);

    const toggleSession = async (add: boolean) => {
        if (add) {
            await addSession(
                session,
                sessionDateEvent,
                attendee,
                attendance,
                groupType,
            );
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

    const groupType = instance?.attributesObject?.["bFnIjGJpf9t"];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const disabledDate: DatePickerProps["disabledDate"] = (current) => {
        return current && current > dayjs().endOf("day");
    };

    const [occurredAt, setOccurredAt] = useState<dayjs.Dayjs | undefined>(
        undefined,
    );
    const [selectedSessions, setSelectedSessions] = useState<string>("");

    const sessionColumns: TableProps<EventDisplay>["columns"] = [
        {
            title: "Event",
            dataIndex: "event",
            key: "event",
        },
        {
            title: "Activity Date",
            dataIndex: "occurredAt",
            key: "occurredAt",
            render: (date) => dayjs(date).format("YYYY-MM-DD"),
        },
    ];

    const expandedRowRender = (record: EventDisplay) => {
        const others =
            record.dataValues
                ?.find((a) => a.dataElement === "ygHFm67aRqZ")
                ?.value?.split(",") ?? [];
        return (
            <Table
                columns={columns?.concat(
                    others.map((a) => ({
                        title: a,
                        dataIndex: a,
                        key: a,
                        align: "center",
                        render: (_, row) => {
                            return (
                                <Attendance
                                    session={a}
                                    sessionDateEvent={record}
                                    attendee={row}
                                    groupType={groupType}
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
            dataValues: [
                { dataElement: "ygHFm67aRqZ", value: selectedSessions },
            ],
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
        setSelectedSessions(() => "");
        setOccurredAt(() => undefined);
        setIsModalOpen(() => false);
    };

    const handleCancel = () => {
        setIsModalOpen(() => false);
    };

    return (
        <div className="overflow-auto flex flex-col gap-2">
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
                expandable={{ expandedRowRender, indentSize: 0 }}
                scroll={{ x: "max-content" }}
            />

            <Modal
                title="Individual Beneficiaries"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width="30%"
                okButtonProps={{ disabled: !occurredAt || !selectedSessions }}
            >
                <Space direction="vertical" style={{ width: "100%" }}>
                    <Space direction="vertical">
                        <span>Activity Date</span>
                        <DatePicker
                            format="YYYY-MM-DD"
                            disabledDate={disabledDate}
                            className="w-full"
                            value={occurredAt}
                            onChange={(date) => setOccurredAt(date)}
                        />
                    </Space>
                    <Space
                        direction="vertical"
                        style={{ backgroundColor: "yellow", width: "100%" }}
                    >
                        <span>Sessions</span>
                        <Dropdown
                            multiple
                            onChange={(value) =>
                                setSelectedSessions(() => value)
                            }
                            search={
                                validSessions?.value
                                    ?.split(",")
                                    .map((s) => sessions[s]) ?? []
                            }
                            value={selectedSessions}
                        />
                    </Space>
                </Space>
            </Modal>
        </div>
    );
}

import { DisplayInstance, Event, Instance } from "@/interfaces";
import { api } from "@/utils/dhis2";
import { generateUid } from "@/utils/uid";
import { useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useParams } from "@tanstack/react-router";
import { Button, DatePicker, Modal, Table } from "antd";

import type { DatePickerProps, TableProps } from "antd";

import dayjs from "dayjs";
import { useState } from "react";
import { columns } from "./columns";
export default function Sessions({
    dataSource,
    activityDates,
}: {
    dataSource: DisplayInstance[];
    activityDates: Array<Partial<Event>>;
}) {
    const client = useQueryClient();

    const { trackedEntity, program } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const currentEntity = useLoaderData({
        from: "/tracker/$program/instances/$trackedEntity",
    });

    const validSessions = currentEntity.attributes.find(
        (a) => a.attribute === "mWyp85xIzXR",
    );

    console.log(validSessions?.value);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const disabledDate: DatePickerProps["disabledDate"] = (current) => {
        return current && current > dayjs().endOf("day");
    };

    const [occurredAt, setOccurredAt] = useState<dayjs.Dayjs | undefined>(
        undefined,
    );

    const sessionColumns: TableProps<Partial<Event>>["columns"] = [
        {
            title: "Activity Date",
            dataIndex: "occurredAt",
            key: "occurredAt",
        },
    ];

    const expandedRowRender = () => {
        return (
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="trackedEntity"
                pagination={false}
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
            orgUnit: currentEntity.orgUnit,
            enrollment: currentEntity.enrollments[0].enrollment,
        };
        client.setQueryData<Partial<Instance>>(
            ["tracked-entity", trackedEntity, program],
            (prev) => {
                if (prev) {
                    return {
                        ...prev,
                        enrollments: prev.enrollments?.map((e) => {
                            return {
                                ...e,
                                events: e.events?.concat([event]),
                            };
                        }),
                    };
                }
                return {};
            },
        );
        await api.post(
            "api/tracker",
            {
                events: [event],
            },
            { params: { async: false } },
        );
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

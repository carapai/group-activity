import { db } from "@/db";
import { DisplayInstance } from "@/interfaces";
import { activityCode, api } from "@/utils/dhis2";
import { generateUid } from "@/utils/uid";
import {
    useLoaderData,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";
import type { TableProps } from "antd";
import { Button, Modal, Table } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import RegistrationForm from "./RegistrationForm";
export default function TrackedEntities() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { program } = useParams({ from: "/tracker/$program" });
    const { programTrackedEntityAttributes } = useLoaderData({
        from: "/tracker/$program",
    });
    const { total } = useLoaderData({
        from: "/tracker/$program/instances",
    });
    const processed = useLiveQuery(() => db.activities.toArray());
    const {
        page,
        pageSize: currentPageSize,
        selectedKeys,
    } = useSearch({
        from: "/tracker/$program/instances",
    });
    const { ou, trackedEntityType } = useSearch({
        from: "/tracker/$program",
    });
    const navigate = useNavigate({ from: "/tracker/$program/instances" });
    const { organisationUnits } = useLoaderData({
        from: "/tracker/$program",
    });

    const isDisabled =
        organisationUnits.filter((a) => a.id === ou).length === 0;
    const columns: TableProps<DisplayInstance>["columns"] =
        programTrackedEntityAttributes.flatMap(
            (
                { trackedEntityAttribute: { id, name }, displayInList },
                index,
            ) => {
                if (displayInList) {
                    if (index === 0) {
                        return {
                            width: 200,
                            fixed: "left",
                            title: name,
                            key: id,
                            render: (_, row) => row.attributesObject?.[id],
                        };
                    }
                    return {
                        title: name,
                        ellipsis: true,
                        key: id,
                        render: (_, row) => row.attributesObject?.[id],
                    };
                }
                return [];
            },
        );

    const rowSelection = {
        onChange: async (
            selectedKeys: React.Key[],
            selectedRows: DisplayInstance[],
        ) => {
            navigate({
                to: "/tracker/$program/instances/$trackedEntity",
                params: {
                    trackedEntity: selectedRows[0].trackedEntity ?? "",
                },
                search: (s) => ({
                    ...s,
                    selectedKeys:
                        selectedKeys.length > 0
                            ? String(selectedKeys[0])
                            : undefined,
                }),
            });
        },
    };

    const handleOk = async () => {
        const search = await db.instances.get(selectedKeys);
        if (search && search.firstEnrollment) {
            const {
                firstEnrollment,
                enrollments,
                attributesObject,
                ...trackedEntity
            } = search;
            const attributes = Object.entries(attributesObject ?? {}).map(
                ([attribute, value]) => ({ attribute, value }),
            );
            await api.post(
                "api/tracker",
                {
                    trackedEntities: [{ ...trackedEntity, attributes }],
                },
                { params: { async: false } },
            );
            await db.activities.put(search);

            navigate({
                to: "/tracker/$program/instances/$trackedEntity",
                params: {
                    program,
                    trackedEntity: search.trackedEntity ?? "",
                },
                search: (s) => ({
                    ...s,
                    selectedKeys: search.trackedEntity,
                }),
            });
        } else if (search) {
            const { attributesObject, ...trackedEntity } = search;
            const attributes = Object.entries(attributesObject ?? {}).map(
                ([attribute, value]) => ({ attribute, value }),
            );
            const enrollment = generateUid();
            await api.post(
                "api/trackedEntityInstances",
                {
                    trackedEntityInstances: [
                        {
                            ...trackedEntity,
                            attributes,
                            enrollments: [
                                {
                                    enrollment,
                                    orgUnit: ou,
                                    program,
                                    trackedEntityInstance:
                                        trackedEntity.trackedEntity,
                                    enrollmentDate: new Date().toISOString(),
                                    incidentDate: new Date().toISOString(),
                                    attributes,
                                },
                            ],
                            trackedEntityInstance: trackedEntity.trackedEntity,
                        },
                    ],
                },
                { params: { async: false } },
            );

            const currentInstance: DisplayInstance = {
                ...trackedEntity,
                trackedEntity: trackedEntity.trackedEntity ?? "",
                attributes,
                attributesObject,
                firstEnrollment: enrollment,
            };
            db.activities.put(currentInstance);
            navigate({
                to: "/tracker/$program/instances/$trackedEntity",
                params: {
                    program,
                    trackedEntity: currentInstance.trackedEntity ?? "",
                },
                search: (s) => ({
                    ...s,
                    selectedKeys: currentInstance.trackedEntity,
                }),
            });
        }

        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const addActivity = async () => {
        db.instances.clear();
        const code = await activityCode(ou);
        const id = generateUid();
        await db.instances.put({
            trackedEntity: id,
            trackedEntityType,
            orgUnit: ou,
            attributes: [{ attribute: "oqabsHE0ZUI", value: code }],
            attributesObject: { oqabsHE0ZUI: code },
        });
        navigate({
            to: "/tracker/$program/instances",
            params: {
                program,
            },
            search: (s) => ({
                ...s,
                selectedKeys: id,
            }),
        });
        setIsModalOpen(() => true);
    };

    const edit = async (trackedEntity: DisplayInstance) => {
        if (trackedEntity) {
            await db.instances.clear();
            await db.instances.put(trackedEntity);
            navigate({
                to: "/tracker/$program/instances/$trackedEntity",
                params: {
                    program,
                    trackedEntity: trackedEntity.trackedEntity ?? "",
                },
                search: (s) => ({
                    ...s,
                    selectedKeys: trackedEntity.trackedEntity,
                }),
            });
            setIsModalOpen(() => true);
        }
    };

    return (
        <div className="p-2 flex flex-col gap-3">
            <div className="flex flex-row items-center justify-end">
                <Button onClick={() => addActivity()} disabled={isDisabled}>
                    Add Activity
                </Button>
            </div>
            <Table
                scroll={{ x: "max-content" }}
                bordered
                style={{ whiteSpace: "nowrap" }}
                columns={[
                    ...columns,
                    {
                        title: "Actions",
                        dataIndex: "actions",
                        key: "actions",
                        width: 80,
                        fixed: "right",
                        render: (_, row) => (
                            <Button onClick={() => edit(row)}>Edit</Button>
                        ),
                    },
                ]}
                dataSource={processed}
                rowKey="trackedEntity"
                rowSelection={{
                    type: "radio",
                    selectedRowKeys: selectedKeys ? [selectedKeys] : [],
                    ...rowSelection,
                }}
                pagination={{
                    pageSize: currentPageSize,
                    total,
                    current: page,
                    onChange: (page, pageSize) =>
                        navigate({
                            search: (s) => {
                                if (pageSize !== currentPageSize) {
                                    return {
                                        ...s,
                                        page: 1,
                                        pageSize,
                                    };
                                }
                                return { ...s, page };
                            },
                        }),
                }}
            />
            <Modal
                title="Group activity details"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={"50%"}
            >
                <RegistrationForm
                    programTrackedEntityAttributes={
                        programTrackedEntityAttributes
                    }
                    program={program}
                />
            </Modal>
        </div>
    );
}

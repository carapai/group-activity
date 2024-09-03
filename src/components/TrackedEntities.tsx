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
import { useState } from "react";
import RegistrationForm from "./RegistrationForm";
export default function TrackedEntities() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { program } = useParams({ from: "/tracker/$program" });
    const { programStages, programTrackedEntityAttributes } = useLoaderData({
        from: "/tracker/$program",
    });
    const { processed, total } = useLoaderData({
        from: "/tracker/$program/instances",
    });
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
                    ps: programStages[0].id,
                }),
            });
        },
    };

    const handleOk = async () => {
        setIsModalOpen(false);
        const search = await db.instances.get(selectedKeys);
        if (search && search.firstEnrollment) {
            const { firstEnrollment, attributesObject, ...trackedEntity } =
                search;
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
        } else if (search) {
            const { attributesObject, ...trackedEntity } = search;
            const attributes = Object.entries(attributesObject ?? {}).map(
                ([attribute, value]) => ({ attribute, value }),
            );
            await api.post(
                "api/trackedEntityInstances",
                {
                    trackedEntityInstances: [
                        {
                            ...trackedEntity,
                            attributes,
                            enrollments: [
                                {
                                    orgUnit: ou,
                                    program,
                                    trackedEntity: trackedEntity.trackedEntity,
                                    enrolledAt: new Date().toISOString(),
                                    attributes,
                                },
                            ],
                        },
                    ],
                },
                { params: { async: false } },
            );
        }
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const addActivity = async () => {
        const code = await activityCode(ou);
        const id = generateUid();
        db.instances.put({
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

    return (
        <div className="p-2 flex flex-col gap-3">
            <div>
                <Button onClick={() => setIsModalOpen(() => true)}>
                    Edit Activity
                </Button>
                <Button onClick={() => addActivity()} disabled={isDisabled}>
                    Add Activity
                </Button>
            </div>
            <Table
                scroll={{ x: "max-content" }}
                bordered
                style={{ whiteSpace: "nowrap" }}
                columns={columns}
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
                title="Individual Beneficiaries"
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

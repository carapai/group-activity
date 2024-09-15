import { db } from "@/db";
import { DisplayInstance, InstanceGenerator, Program } from "@/interfaces";
import { api } from "@/utils/dhis2";
import { generateUid } from "@/utils/uid";
import { clean, cleanAndSingularize, generateInstance } from "@/utils/utils";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import type { TableProps } from "antd";
import { Breadcrumb, Button, Divider, Modal, Table } from "antd";
import React, { useCallback, useMemo, useState } from "react";
import RegistrationForm from "./RegistrationForm";
import dayjs from "dayjs";

const TrackedEntities = ({ program }: { program: Program }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { total, processed } = useLoaderData({
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

    const isDisabled = useMemo(
        () => organisationUnits.filter((a) => a.id === ou).length === 0,
        [organisationUnits, ou],
    );

    const columns: TableProps<DisplayInstance>["columns"] = useMemo(
        () =>
            program.programTrackedEntityAttributes.flatMap(
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
            ),
        [program],
    );

    const rowSelection = useMemo(
        () => ({
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
        }),
        [navigate],
    );

    const handleOk = useCallback(async () => {
        const search = await db.instances.limit(1).first();
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
                    program: program.id,
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
                "api/tracker",
                {
                    trackedEntities: [
                        {
                            ...trackedEntity,
                            attributes,
                            enrollments: [
                                {
                                    enrollment,
                                    orgUnit: trackedEntity.orgUnit,
                                    program: program.id,
                                    trackedEntity: trackedEntity.trackedEntity,
                                    enrolledAt: new Date().toISOString(),
                                    occurredAt: new Date().toISOString(),
                                    attributes,
                                },
                            ],
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
                    program: program.id,
                    trackedEntity: currentInstance.trackedEntity ?? "",
                },
                search: (s) => ({
                    ...s,
                    selectedKeys: currentInstance.trackedEntity,
                }),
            });
        }
        setIsModalOpen(false);
    }, [selectedKeys, ou, program, navigate]);

    const handleCancel = useCallback(() => {
        setIsModalOpen(false);
    }, []);

    const addActivity = useCallback(async () => {
        let instance: InstanceGenerator = {
            ou,
            trackedEntityType,
            programTrackedEntityAttributes:
                program.programTrackedEntityAttributes,
            table: db.instances,
        };

        if (program.id === "IXxHJADVCkb") {
            instance = {
                ...instance,
                defaultValues: {
                    Ah4eyDOBf51: "IDI",
                    b76aEJUPnLy: dayjs().format("YYYY-MM-DD"),
                },
            };
        }
        await generateInstance(instance);
        setIsModalOpen(true);
    }, [ou, trackedEntityType]);

    const edit = useCallback(async (trackedEntity: DisplayInstance) => {
        if (trackedEntity) {
            await db.instances.clear();
            await db.instances.put(trackedEntity);
            setIsModalOpen(true);
        }
    }, []);

    const handleTableChange = useCallback(
        (pagination: any) => {
            navigate({
                search: (s) => {
                    if (pagination.pageSize !== currentPageSize) {
                        return {
                            ...s,
                            page: 1,
                            pageSize: pagination.pageSize,
                        };
                    }
                    return { ...s, page: pagination.current };
                },
            });
        },
        [navigate, currentPageSize],
    );

    const actionColumn: TableProps<DisplayInstance>["columns"] = useMemo<
        TableProps<DisplayInstance>["columns"]
    >(
        () => [
            {
                title: "Actions",
                dataIndex: "actions",
                key: "actions",
                width: 80,
                fixed: "right",
                render: (_: any, row: DisplayInstance) => (
                    <Button onClick={() => edit(row)}>Edit</Button>
                ),
            },
        ],
        [edit],
    );

    return (
        <div className="p-2 flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between">
                <Breadcrumb items={[{ title: clean(program.name) }]} />
                <Button onClick={addActivity} disabled={isDisabled}>
                    {`Add ${cleanAndSingularize(program.name)}`}
                </Button>
            </div>
            <Table
                scroll={{ x: "max-content" }}
                bordered
                style={{ whiteSpace: "nowrap" }}
                columns={[...columns, ...(actionColumn ?? [])]}
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
                    onChange: handleTableChange,
                }}
            />
            <Modal
                title={`Adding/Editing ${cleanAndSingularize(program.name)}`}
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={"50%"}
            >
                <Divider />
                <RegistrationForm
                    programTrackedEntityAttributes={
                        program.programTrackedEntityAttributes
                    }
                    program={program.id}
                    table={db.instances}
                />
            </Modal>
        </div>
    );
};

export default React.memo(TrackedEntities);

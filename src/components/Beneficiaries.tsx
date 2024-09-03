import { DisplayInstance } from "@/interfaces";
import { Button, Modal, Table } from "antd";

import { api } from "@/utils/dhis2";
import { useParams } from "@tanstack/react-router";
import { Key, useState } from "react";
import TrackedEntitySearch from "./TrackedEntitySearch";
import { columns } from "./columns";
export default function Beneficiaries({
    previousInstances,
    setDataSource,
    dataSource,
}: {
    previousInstances: Key[];
    setDataSource: React.Dispatch<React.SetStateAction<DisplayInstance[]>>;
    dataSource: DisplayInstance[];
}) {
    const { trackedEntity: tei } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);

    const [instances, setInstances] = useState<DisplayInstance[]>(dataSource);

    const handleAttendeeOk = async () => {
        if (instances.length > 0) {
            setDataSource(() => instances);
            const relationships = instances
                .filter(
                    ({ trackedEntity }) =>
                        previousInstances.indexOf(trackedEntity as Key) === -1,
                )
                .map(({ trackedEntity }) => ({
                    to: { trackedEntity: { trackedEntity: tei } },
                    from: { trackedEntity: { trackedEntity } },
                    relationshipType: "jtpmu5rCeer",
                }));
            await api.post(
                "api/tracker",
                { relationships },
                { params: { async: false } },
            );
        }
        setIsAttendeeModalOpen(() => false);
    };
    const handleAttendeeCancel = () => {
        setIsAttendeeModalOpen(() => false);
    };

    return (
        <div className="h-[700px] overflow-auto flex flex-col gap-2">
            <div>
                <Button onClick={() => setIsAttendeeModalOpen(() => true)}>
                    Add Beneficiary
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={dataSource}
                rowKey="trackedEntity"
                pagination={false}
                scroll={{ x: "max-content" }}
            />

            <Modal
                title="Beneficiaries"
                open={isAttendeeModalOpen}
                onOk={handleAttendeeOk}
                onCancel={handleAttendeeCancel}
                width="60%"
            >
                <TrackedEntitySearch
                    ou="yGTl6Vb8EF4"
                    program="RDEklSXCD4C"
                    setInstances={setInstances}
                    selectedKeys={previousInstances}
                    displays={[
                        {
                            name: "Individual Code",
                            id: "HLKc2AKR9jW",
                        },
                        {
                            name: "Name of Beneficiary",
                            id: "huFucxA3e5c",
                        },
                        {
                            name: "Sex",
                            id: "CfpoFtRmK1z",
                        },
                    ]}
                />
            </Modal>
        </div>
    );
}

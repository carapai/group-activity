import { db } from "@/db";
import { DisplayInstance } from "@/interfaces";
import { api } from "@/utils/dhis2";
import { useParams } from "@tanstack/react-router";
import { Button, Modal } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { columns, groupColumns } from "./columns";
import TrackedEntitySearch from "./TrackedEntitySearch";

export default function BeneficiaryList({
    title,
    modalTitle,
    relationshipType,
    currentIsFrom,
}: {
    title?: string;
    modalTitle?: string;
    relationshipType: string;
    currentIsFrom: boolean;
}) {
    const participants = useLiveQuery(() => db.participants.toArray());
    const { trackedEntity: tei } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const { program } = useParams({
        from: "/tracker/$program",
    });
    const [instances, setInstances] = useState<DisplayInstance[]>([]);

    const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    const handleAttendeeOk = async () => {
        if (instances.length > 0) {
            const previousInstances =
                participants?.flatMap((p) =>
                    p.trackedEntity ? p.trackedEntity : [],
                ) ?? [];
            const validInstances = instances.filter(
                ({ trackedEntity }) =>
                    trackedEntity &&
                    previousInstances.indexOf(trackedEntity) === -1,
            );
            const relationships = validInstances.map(({ trackedEntity }) => {
                let to = { trackedEntity: { trackedEntity: tei } };
                let from = { trackedEntity: { trackedEntity } };
                if (currentIsFrom && trackedEntity) {
                    from = {
                        trackedEntity: { trackedEntity: tei },
                    };
                    to = {
                        trackedEntity: { trackedEntity },
                    };
                }
                return { from, to, relationshipType };
            });
            await api.post(
                "api/tracker",
                { relationships },
                { params: { async: false } },
            );
            await db.participants.bulkPut(validInstances);
        }
        setIsAttendeeModalOpen(() => false);
    };
    const handleAttendeeCancel = () => {
        setIsAttendeeModalOpen(() => false);
    };
    const handleGroupCancel = () => {
        setIsGroupModalOpen(() => false);
    };

    return (
        <div>
            <div>
                <div className="flex gap-2 flex-row">
                    <Button onClick={() => setIsAttendeeModalOpen(() => true)}>
                        {title ?? "Add Beneficiaries"}
                    </Button>
                    {program === "IXxHJADVCkb" && (
                        <Button onClick={() => setIsGroupModalOpen(() => true)}>
                            Add Beneficiaries from group
                        </Button>
                    )}
                </div>
                <Modal
                    title={modalTitle ?? "Beneficiaries"}
                    open={isAttendeeModalOpen}
                    onOk={handleAttendeeOk}
                    onCancel={handleAttendeeCancel}
                    width="75%"
                >
                    <TrackedEntitySearch
                        setInstances={setInstances}
                        selectedKeys={
                            participants?.map((p) => p.trackedEntity ?? "") ??
                            []
                        }
                        displays={
                            columns?.map((c) => ({
                                id: String(c.key ?? ""),
                                name: String(c.title ?? ""),
                            })) ?? []
                        }
                        program="RDEklSXCD4C"
                    />
                </Modal>

                {program === "IXxHJADVCkb" && (
                    <Modal
                        title="Groups"
                        open={isGroupModalOpen}
                        onOk={handleAttendeeOk}
                        onCancel={handleGroupCancel}
                        width="75%"
                    >
                        <TrackedEntitySearch
                            setInstances={setInstances}
                            selectedKeys={
                                participants?.map(
                                    (p) => p.trackedEntity ?? "",
                                ) ?? []
                            }
                            displays={
                                groupColumns?.map((c) => ({
                                    id: String(c.key ?? ""),
                                    name: String(c.title ?? ""),
                                })) ?? []
                            }
                            program="azl3du5TrAR"
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
}

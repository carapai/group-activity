import { db } from "@/db";
import { DisplayInstance, ProgramTrackedEntityAttribute } from "@/interfaces";
import { api } from "@/utils/dhis2";
import { generateInstance } from "@/utils/utils";
import { useParams } from "@tanstack/react-router";
import { Button, Modal } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import React, { useCallback, useMemo, useState } from "react";
import { columns, groupColumns } from "./columns";
import RegistrationForm from "./RegistrationForm";
import SwitchComponent, { Case } from "./SwitchComponent";
import TrackedEntitySearch from "./TrackedEntitySearch";
import { generateUid } from "@/utils/uid";

const indirectAttributes: ProgramTrackedEntityAttribute[] = [
    {
        name: "6. Indirect Beneficiaries Indirect Beneficiary Code",
        displayInList: true,
        sortOrder: 1,
        mandatory: false,
        valueType: "TEXT",
        id: "PHUdxIymdjF",
        allowFutureDate: false,
        trackedEntityAttribute: {
            name: "Indirect Beneficiary Code",
            valueType: "TEXT",
            unique: true,
            generated: true,
            pattern: 'ORG_UNIT_CODE(........)+"-IND-"+SEQUENTIAL(####)',
            orgunitScope: false,
            displayFormName: "Beneficiary Code",
            optionSetValue: false,
            id: "X4pNSt9UzOw",
        },
    },
    {
        name: "6. Indirect Beneficiaries Name of Beneficiary",
        displayInList: true,
        sortOrder: 2,
        mandatory: false,
        valueType: "TEXT",
        id: "a0GP3vNWpyW",
        allowFutureDate: false,
        trackedEntityAttribute: {
            name: "Name of Beneficiary",
            valueType: "TEXT",
            unique: false,
            generated: false,
            pattern: "",
            orgunitScope: false,
            displayFormName: "Name of Beneficiary",
            optionSetValue: false,
            id: "huFucxA3e5c",
        },
    },
    {
        name: "6. Indirect Beneficiaries HHM. Sex",
        displayInList: true,
        sortOrder: 3,
        mandatory: false,
        valueType: "TEXT",
        id: "ksaUwFUOvvP",
        allowFutureDate: false,
        trackedEntityAttribute: {
            name: "HHM. Sex",
            valueType: "TEXT",
            optionSet: {
                options: [
                    {
                        code: "Male",
                        name: "Male",
                        id: "BDQ45PaIeZK",
                    },
                    {
                        code: "Female",
                        name: "Female",
                        id: "nvFIPrFzcrJ",
                    },
                ],
            },
            unique: false,
            generated: false,
            pattern: "",
            orgunitScope: false,
            displayFormName: "Sex",
            optionSetValue: true,
            id: "CfpoFtRmK1z",
        },
    },
    {
        name: "6. Indirect Beneficiaries HHM. Date of birth",
        displayInList: true,
        sortOrder: 4,
        mandatory: false,
        valueType: "AGE",
        id: "vUqHzF5EPWb",
        allowFutureDate: false,
        trackedEntityAttribute: {
            name: "HHM. Date of birth",
            valueType: "AGE",
            unique: false,
            generated: false,
            pattern: "",
            orgunitScope: false,
            displayFormName: "Date of birth",
            optionSetValue: false,
            id: "N1nMqKtYKvI",
        },
    },
];

const BeneficiaryList: React.FC<{
    title?: string;
    modalTitle?: string;
    relationshipType: string;
    currentIsFrom: boolean;
}> = React.memo(({ title, modalTitle, relationshipType, currentIsFrom }) => {
    const participants = useLiveQuery(() => db.participants.toArray());
    const { trackedEntity: tei } = useParams({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const { program } = useParams({
        from: "/tracker/$program",
    });
    const [instances, setInstances] = useState<DisplayInstance[]>([]);
    const [isAttendeeModalOpen, setIsAttendeeModalOpen] = useState(false);
    const [currentModal, setCurrentModal] = useState<string>("indirect");
    const [modalSize, setModalSize] = useState<string>("75%");

    const handleAttendeeOk = useCallback(async () => {
        if (currentModal === "indirect") {
            const indirect = await db.indirectBeneficiaries.limit(1).first();
            if (indirect) {
                const attributes = Object.entries(
                    indirect.attributesObject ?? {},
                ).map(([attribute, value]) => ({
                    attribute,
                    value,
                }));
                const from = currentIsFrom
                    ? {
                          trackedEntity: {
                              trackedEntity: tei,
                          },
                      }
                    : {
                          trackedEntity: {
                              trackedEntity: indirect.trackedEntity,
                          },
                      };
                const to = currentIsFrom
                    ? {
                          trackedEntity: {
                              trackedEntity: indirect.trackedEntity,
                          },
                      }
                    : {
                          trackedEntity: {
                              trackedEntity: tei,
                          },
                      };
                const relationships = [
                    { from, to, relationshipType: "XzKmUgJRlRa" },
                ];

                await api.post(
                    "api/tracker",
                    {
                        relationships,
                        trackedEntities: [
                            {
                                ...indirect,
                                attributes,
                                enrollments: [
                                    {
                                        enrollment: generateUid(),
                                        orgUnit: indirect.orgUnit,
                                        program: "lMC8XN5Lanc",
                                        trackedEntityInstance:
                                            indirect.trackedEntity,
                                        enrolledAt: new Date().toISOString(),
                                        occurredAt: new Date().toISOString(),
                                        attributes,
                                    },
                                ],
                                trackedEntityInstance: indirect.trackedEntity,
                            },
                        ],
                    },
                    { params: { async: false } },
                );
                await db.participants.put(indirect);
            }
        } else {
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
                const relationships = validInstances.map(
                    ({ trackedEntity }) => {
                        const from = currentIsFrom
                            ? { trackedEntity: { trackedEntity: tei } }
                            : { trackedEntity: { trackedEntity } };
                        const to = currentIsFrom
                            ? { trackedEntity: { trackedEntity } }
                            : { trackedEntity: { trackedEntity: tei } };
                        return { from, to, relationshipType };
                    },
                );
                await api.post(
                    "api/tracker",
                    { relationships },
                    { params: { async: false } },
                );
                await db.participants.bulkPut(validInstances);
            }
        }
        setIsAttendeeModalOpen(false);
    }, [instances, participants, tei, currentIsFrom, relationshipType]);

    const handleAttendeeCancel = useCallback(() => {
        setIsAttendeeModalOpen(false);
    }, []);

    const openDialog = useCallback(async (currentDialog: string) => {
        setCurrentModal(currentDialog);
        if (currentDialog === "indirect") {
            const currentInstance = await db.instances.get(tei);
            if (currentInstance && currentInstance.orgUnit) {
                await generateInstance({
                    table: db.indirectBeneficiaries,
                    programTrackedEntityAttributes: indirectAttributes,
                    ou: currentInstance.orgUnit,
                    trackedEntityType: "NXXluGIp2GB",
                });
                setModalSize(() => "60%");
                setIsAttendeeModalOpen(true);
            }
        } else {
            setIsAttendeeModalOpen(true);
        }
    }, []);

    const selectedKeys = useMemo(
        () => participants?.map((p) => p.trackedEntity ?? "") ?? [],
        [participants],
    );

    const groupDisplays = useMemo(
        () =>
            groupColumns?.map((c) => ({
                id: String(c.key ?? ""),
                name: String(c.title ?? ""),
            })) ?? [],
        [],
    );

    const directDisplays = useMemo(
        () =>
            columns?.map((c) => ({
                id: String(c.key ?? ""),
                name: String(c.title ?? ""),
            })) ?? [],
        [],
    );

    return (
        <div>
            <div>
                <div className="flex gap-2 flex-row">
                    <Button onClick={() => openDialog("indirect")}>
                        Add Indirect Beneficiary
                    </Button>
                    {program === "IXxHJADVCkb" && (
                        <Button onClick={() => openDialog("group")}>
                            Add Beneficiaries from group
                        </Button>
                    )}
                    <Button onClick={() => openDialog("direct")}>
                        {title ?? "Select Direct Beneficiaries"}
                    </Button>
                </div>
                <Modal
                    title={modalTitle ?? "Beneficiaries"}
                    open={isAttendeeModalOpen}
                    onOk={handleAttendeeOk}
                    onCancel={handleAttendeeCancel}
                    width={modalSize}
                >
                    <SwitchComponent condition={currentModal}>
                        <Case value="indirect">
                            <RegistrationForm
                                programTrackedEntityAttributes={
                                    indirectAttributes
                                }
                                program="lMC8XN5Lanc"
                                table={db.indirectBeneficiaries}
                            />
                        </Case>
                        <Case value="group">
                            <TrackedEntitySearch
                                setInstances={setInstances}
                                selectedKeys={selectedKeys}
                                displays={groupDisplays}
                                program="azl3du5TrAR"
                            />
                        </Case>
                        <Case default>
                            <TrackedEntitySearch
                                setInstances={setInstances}
                                selectedKeys={selectedKeys}
                                displays={directDisplays}
                                program="RDEklSXCD4C"
                            />
                        </Case>
                    </SwitchComponent>
                </Modal>
            </div>
        </div>
    );
});

export default BeneficiaryList;

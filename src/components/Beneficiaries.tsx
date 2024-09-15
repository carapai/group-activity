import { db } from "@/db";
import { Table } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import BeneficiaryList from "./BeneficiaryList";
import { columns } from "./columns";
export default function Beneficiaries({
    title,
    modalTitle,
    currentIsFrom,
    relationshipType,
}: {
    title?: string;
    modalTitle?: string;
    relationshipType: string;
    currentIsFrom: boolean;
}) {
    const participants = useLiveQuery(() => db.participants.toArray());
    return (
        <div className="h-[700px] overflow-auto flex flex-col gap-2">
            <Table
                columns={columns}
                dataSource={participants}
                rowKey="trackedEntity"
                pagination={false}
                scroll={{ x: "max-content" }}
                bordered
                footer={() => (
                    <div className="flex flex-row justify-end items-center">
                        <BeneficiaryList
                            title={title}
                            modalTitle={modalTitle}
                            relationshipType={relationshipType}
                            currentIsFrom={currentIsFrom}
                        />
                    </div>
                )}
            />
        </div>
    );
}

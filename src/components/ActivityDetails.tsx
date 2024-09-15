import { Tabs } from "antd";
import Beneficiaries from "./Beneficiaries";
import Sessions from "./Sessions";
export default function ActivityDetails() {
    return (
        <div className="p-2">
            <Tabs
                defaultActiveKey="aTZwDRoJnxj"
                items={[
                    {
                        label: "Beneficiaries",
                        key: "aTZwDRoJnxj",
                        children: (
                            <Beneficiaries
                                title="Select Direct Beneficiaries"
                                modalTitle="Beneficiary List"
                                currentIsFrom={false}
                                relationshipType="jtpmu5rCeer"
                            />
                        ),
                    },
                    {
                        label: "Sessions",
                        key: "VzkQBBglj3O",
                        children: <Sessions />,
                    },
                ]}
            />
        </div>
    );
}

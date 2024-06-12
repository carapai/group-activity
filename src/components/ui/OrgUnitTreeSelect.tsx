import { OrgUnit } from "@/interfaces";
import { TreeSelect } from "antd";

export default function OrgUnitTreeSelect({
    organisationUnits,
    value,
    onChange,
}: {
    organisationUnits: OrgUnit[];
    value: string;
    onChange: (newValue: string) => void;
}) {
    return (
        <TreeSelect
            showSearch
            style={{ width: "100%" }}
            value={value}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Please select"
            allowClear
            onChange={onChange}
            treeData={organisationUnits}
            treeDataSimpleMode={{ pId: "parent", id: "key" }}
        />
    );
}

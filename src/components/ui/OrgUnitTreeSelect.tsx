import { OrgUnit } from "@/interfaces";
import { TreeSelect } from "antd";
import { useState } from "react";

export default function OrgUnitTreeSelect({
    organisationUnits,
    value,
    onChange,
}: {
    organisationUnits: OrgUnit[];
    value: string;
    onChange: (newValue: string) => void;
}) {
    const [treeData, setTreeData] = useState<OrgUnit[]>(organisationUnits);

    const onSearch = (value: string) => {
        setTreeData(() =>
            organisationUnits.filter((ou) =>
                String(ou.title).toLowerCase().includes(value.toLowerCase()),
            ),
        );
    };
    return (
        <TreeSelect
            showSearch
            style={{ width: "100%" }}
            value={value}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Please select"
            allowClear
            onChange={onChange}
            treeData={treeData}
            treeDataSimpleMode={true}
            onSearch={onSearch}
            filterTreeNode={false}
        />
    );
}

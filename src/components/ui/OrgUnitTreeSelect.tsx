import { OrgUnit } from "@/interfaces";
import { TreeSelect } from "antd";
import { SyntheticEvent, useState } from "react";

export default function OrgUnitTreeSelect({
    organisationUnits,
}: {
    organisationUnits: OrgUnit[];
}) {
    const [value, setValue] = useState<string>();

    const onChange = (newValue: string) => {
        setValue(newValue);
    };

    const onPopupScroll = (e: SyntheticEvent) => {
        console.log("onPopupScroll", e);
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
            treeData={organisationUnits}
            treeDataSimpleMode={{ pId: "parent", id: "key" }}
            onPopupScroll={onPopupScroll}
        />
    );
}

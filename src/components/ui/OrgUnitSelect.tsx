import { OrgUnit } from "@/interfaces";
import { orgUnitQueryOptions } from "@/utils/queryOptions";
import { useQueryClient } from "@tanstack/react-query";
import type { TreeSelectProps } from "antd";
import { TreeSelect } from "antd";
import { IndexableType, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { FC } from "react";

const OrgUnitSelect: FC<{
    table: Table<OrgUnit, IndexableType>;
    value: string;
    onChange: (newValue: string) => void;
}> = ({ table, value, onChange }) => {
    const queryClient = useQueryClient();
    const organisationUnits = useLiveQuery(() => table.toArray());

    const onLoadData: TreeSelectProps["loadData"] = async ({ value }) => {
        if (value) {
            await queryClient.ensureQueryData(
                orgUnitQueryOptions(value.toString(), table),
            );
        }
    };
    return (
        <TreeSelect
            treeDataSimpleMode
            style={{ width: "100%" }}
            value={value}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            placeholder="Please select"
            onChange={onChange}
            loadData={onLoadData}
            treeData={organisationUnits}
        />
    );
};

export default OrgUnitSelect;

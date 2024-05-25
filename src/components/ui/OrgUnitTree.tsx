import { OrgUnit } from "@/interfaces";
import { searchFilter } from "@/utils/utils";
import { Input, Tree } from "antd";
import arrayToTree from "array-to-tree";
import { useState } from "react";

const { Search } = Input;

export default function OrgUnitTree({
    organisationUnits,
}: {
    organisationUnits: OrgUnit[];
}) {
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [searchValue, setSearchValue] = useState("");
    const [autoExpandParent, setAutoExpandParent] = useState(true);

    const onExpand = (newExpandedKeys: React.Key[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };
    const [treeData, setTreeData] = useState(
        arrayToTree(organisationUnits, {
            parentProperty: "parent",
            childrenProperty: "children",
            customID: "key",
        })
    );

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const searched = searchFilter(treeData, value);
        // setExpandedKeys(uniqueSearches);
        setTreeData((prev) => {
            if (searched.length > 0) {
                return searched;
            }
            return prev;
        });
        setSearchValue(value);
        setAutoExpandParent(true);
    };
    return (
        <div className="p-2">
            <Search
                style={{ marginBottom: 8 }}
                placeholder="Search"
                onChange={onChange}
                value={searchValue}
            />

            <Tree
                treeData={treeData}
                onExpand={onExpand}
                expandedKeys={expandedKeys}
                autoExpandParent={autoExpandParent}
            />
        </div>
    );
}

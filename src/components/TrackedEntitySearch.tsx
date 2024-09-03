import { DisplayInstance } from "@/interfaces";
import { instancesQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import type { TableColumnsType, TableProps } from "antd";
import { Input, Pagination, Table } from "antd";
import type { SearchProps } from "antd/es/input/Search";
import { Key, useState } from "react";

type TableRowSelection<T> = TableProps<T>["rowSelection"];

const { Search } = Input;

export default function TrackedEntitySearch({
    ou,
    program,
    setInstances,
    displays,
    selectedKeys,
}: {
    ou: string;
    program: string;
    setInstances: React.Dispatch<React.SetStateAction<DisplayInstance[]>>;
    displays: Array<{ id: string; name: string }>;
    selectedKeys: Key[];
}) {
    const [selectedRowKeys, setSelectedRowKeys] =
        useState<React.Key[]>(selectedKeys);
    const [pager, setPager] = useState<{ page: number; pageSize: number }>({
        page: 1,
        pageSize: 10,
    });

    const {
        data: { processed, total },
    } = useSuspenseQuery(
        instancesQueryOptions({
            program,
            ou,
            page: pager.page,
            pageSize: pager.pageSize,
        }),
    );
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setInstances(() =>
            processed.filter(
                ({ trackedEntity }) =>
                    trackedEntity &&
                    newSelectedRowKeys
                        .map((a) => String(a))
                        .indexOf(trackedEntity) !== -1,
            ),
        );
    };

    const columns: TableColumnsType<DisplayInstance> = displays.map(
        ({ id, name }) => ({
            title: name,
            dataIndex: id,
            key: id,
            render: (_, record) => record.attributesObject?.[id],
        }),
    );

    const rowSelection: TableRowSelection<DisplayInstance> = {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE,
            {
                key: "odd",
                text: "Select Odd Row",
                onSelect: (changeableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changeableRowKeys.filter(
                        (_, index) => {
                            if (index % 2 !== 0) {
                                return false;
                            }
                            return true;
                        },
                    );
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
            {
                key: "even",
                text: "Select Even Row",
                onSelect: (changeableRowKeys) => {
                    let newSelectedRowKeys = [];
                    newSelectedRowKeys = changeableRowKeys.filter(
                        (_, index) => {
                            if (index % 2 !== 0) {
                                return true;
                            }
                            return false;
                        },
                    );
                    setSelectedRowKeys(newSelectedRowKeys);
                },
            },
        ],
    };

    const onSearch: SearchProps["onSearch"] = (value, _e, info) =>
        console.log(info?.source, value);

    return (
        <div className="flex flex-col gap-2">
            <Search placeholder="input search text" onSearch={onSearch} />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={processed as DisplayInstance[]}
                rowKey="trackedEntity"
                bordered
                pagination={false}
            />
            <Pagination
                total={total}
                pageSize={pager.pageSize}
                current={pager.page}
                onChange={(page, pageSize) => {
                    if (pageSize !== pager.pageSize) {
                        setPager({ page: 1, pageSize });
                    } else {
                        setPager({ page, pageSize });
                    }
                }}
            />
        </div>
    );
}

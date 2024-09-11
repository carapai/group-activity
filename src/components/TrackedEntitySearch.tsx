import { DisplayInstance, SearchCriteria } from "@/interfaces";
import { instancesSearchQueryOptions } from "@/utils/queryOptions";
import { SearchOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import type { InputRef, TableColumnsType, TableProps } from "antd";
import { Button, Checkbox, Input, Space, Table, Tag } from "antd";
import { ColumnType } from "antd/es/table";
import { FilterConfirmProps } from "antd/es/table/interface";
import { Key, useCallback, useEffect, useRef, useState } from "react";

type TableRowSelection<T> = TableProps<T>["rowSelection"];

export default function TrackedEntitySearch({
    setInstances,
    displays,
    selectedKeys,
    program,
}: {
    setInstances: React.Dispatch<React.SetStateAction<DisplayInstance[]>>;
    displays: Array<{ id: string; name: string }>;
    selectedKeys: Key[];
    program: string;
}) {
    const searchInput = useRef<InputRef>(null);
    const [data, setData] = useState<DisplayInstance[]>([]);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({});
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
            total: 0,
        },
    });
    const [selectedRowKeys, setSelectedRowKeys] =
        useState<React.Key[]>(selectedKeys);

    const { instance } = useLoaderData({
        from: "/tracker/$program/instances/$trackedEntity",
    });

    const [ou, setOu] = useState<string>(instance.orgUnit);

    const handleSearch = (
        selectedKeys: string[],
        confirm: (param?: FilterConfirmProps) => void,
        dataIndex: string,
    ) => {
        confirm();
        const newSearchCriteria = {
            ...searchCriteria,
            [dataIndex]: selectedKeys[0],
        };
        setSearchCriteria(newSearchCriteria);
        setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
        }));
    };

    const handleReset = (clearFilters: () => void, dataIndex: string) => {
        clearFilters();
        const newSearchCriteria = { ...searchCriteria };
        delete newSearchCriteria[dataIndex];
        setSearchCriteria(newSearchCriteria);
        setTableParams((prev) => ({
            ...prev,
            pagination: { ...prev.pagination, current: 1 },
        }));
    };

    const getColumnSearchProps = (
        dataIndex: string,
    ): ColumnType<DisplayInstance> => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        handleSearch(
                            selectedKeys as string[],
                            confirm,
                            dataIndex,
                        )
                    }
                    style={{ width: 188, marginBottom: 8, display: "block" }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            handleSearch(
                                selectedKeys as string[],
                                confirm,
                                dataIndex,
                            )
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() =>
                            clearFilters && handleReset(clearFilters, dataIndex)
                        }
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined
                style={{ color: filtered ? "#1890ff" : undefined }}
            />
        ),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });
    const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
        setSelectedRowKeys(newSelectedRowKeys);
        setInstances(() =>
            data.filter(
                ({ trackedEntity }) =>
                    trackedEntity &&
                    newSelectedRowKeys
                        .map((a) => String(a))
                        .indexOf(trackedEntity) !== -1,
            ),
        );
    };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const { processed, total } = await queryClient.fetchQuery(
                instancesSearchQueryOptions({
                    ou,
                    page: tableParams.pagination.current,
                    pageSize: tableParams.pagination.pageSize,
                    searchCriteria,
                    program,
                }),
            );

            setData(processed);
            setTableParams({
                ...tableParams,
                pagination: {
                    ...tableParams.pagination,
                    total,
                },
            });
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    }, [
        ou,
        searchCriteria,
        tableParams.pagination.pageSize,
        tableParams.pagination.current,
    ]);

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

    const columns: TableColumnsType<DisplayInstance> = displays.map(
        ({ id, name }) => ({
            title: name,
            dataIndex: id,
            key: id,
            render: (_, record) => record.attributesObject?.[id],
            ...getColumnSearchProps(id),
        }),
    );

    const onChange = (checked: boolean) => {
        if (checked) {
            setOu(() => instance.orgUnit);
        } else {
            setOu(() => "yGTl6Vb8EF4");
        }
    };

    const handleTableChange = (pagination: any) => {
        setTableParams({
            pagination,
        });
    };

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="flex flex-col gap-2">
            <Checkbox
                onChange={(e) => onChange(e.target.checked)}
                checked={ou === instance.orgUnit}
            >
                Activity Parish
            </Checkbox>

            <Space style={{ marginBottom: 16 }}>
                {Object.entries(searchCriteria).map(([key, value]) => (
                    <Tag
                        key={key}
                        closable
                        onClose={() => handleReset(() => {}, key)}
                    >
                        {`${key}: ${value}`}
                    </Tag>
                ))}
            </Space>
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={data}
                rowKey="trackedEntity"
                bordered
                pagination={tableParams.pagination}
                loading={loading}
                onChange={handleTableChange}
                scroll={{ x: "max-content" }}
            />
        </div>
    );
}

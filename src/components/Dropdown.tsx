import { db } from "@/db";
import { Select } from "antd";
import { useLiveQuery } from "dexie-react-hooks";
import { isArray } from "lodash";

export default function Dropdown({
    multiple,
    value,
    onChange,
    search,
}: {
    multiple?: boolean;
    value: string;
    onChange: (value: string) => void;
    search: string[];
}) {
    const optionGroups = useLiveQuery(() =>
        db.optionGroups.where("id").anyOf(search).toArray(),
    );
    if (optionGroups === undefined) return <div>Loading...</div>;
    return (
        <Select
            style={{ width: "100%" }}
            size="large"
            showSearch
            placeholder="Select a person"
            mode={multiple ? "multiple" : undefined}
            value={
                multiple
                    ? value === ""
                        ? []
                        : (value.split(",") ?? [])
                    : value
            }
            filterOption={(input, option) => {
                if (option?.label && option.value) {
                    return (
                        option.label
                            .toLowerCase()
                            .includes(input.toLowerCase()) ||
                        option.value.toLowerCase().includes(input.toLowerCase())
                    );
                }
                return false;
            }}
            options={optionGroups.flatMap(({ options }) =>
                options.map(({ code, name }) => ({ label: name, value: code })),
            )}
            onChange={(value) =>
                onChange(isArray(value) ? value.join(",") : value)
            }
        />
    );
}

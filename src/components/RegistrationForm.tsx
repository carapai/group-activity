import { db } from "@/db";
import { ProgramTrackedEntityAttribute } from "@/interfaces";
import { useLiveQuery } from "dexie-react-hooks";
import { formElements } from "./form-elements";
import { useSearch } from "@tanstack/react-router";
import { Select } from "antd";
import { useEffect, useState } from "react";
import { rules } from "@/utils/utils";
import { isArray } from "lodash";

export default function RegistrationForm({
    programTrackedEntityAttributes,
}: {
    program: string;
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
}) {
    const { selectedKeys } = useSearch({
        from: "/tracker/$program/instances",
    });
    const displayInstance = useLiveQuery(
        () => db.instances.get(selectedKeys ? selectedKeys[0] : ""),
        [selectedKeys ? selectedKeys[0] : ""],
    );
    const [currentAttributes, setCurrentAttributes] = useState<
        ProgramTrackedEntityAttribute[]
    >(() => {
        return programTrackedEntityAttributes.map((e) => {
            if (e.trackedEntityAttribute.id === "mWyp85xIzXR") {
                const type =
                    displayInstance?.attributesObject?.["bFnIjGJpf9t"] ?? "";
                return {
                    ...e,
                    trackedEntityAttribute: {
                        ...e.trackedEntityAttribute,
                        optionSetValue: true,
                        optionSet: {
                            options: rules[type],
                        },
                        multiple: true,
                    },
                };
            }
            return e;
        });
    });
    const onBlur = async (value: string, dataElement: string) => {};
    const onChange = (value: string, dataElement: string) => {
        if (displayInstance) {
            db.instances.put({
                ...displayInstance,
                attributesObject: {
                    ...displayInstance.attributesObject,
                    [dataElement]: value,
                },
            });
        }
    };

    useEffect(() => {
        setCurrentAttributes((prev) => {
            return prev.map((e) => {
                if (e.trackedEntityAttribute.id === "mWyp85xIzXR") {
                    return {
                        ...e,
                        trackedEntityAttribute: {
                            ...e.trackedEntityAttribute,
                            optionSetValue: true,
                            optionSet: {
                                options:
                                    rules[
                                        displayInstance?.attributesObject?.[
                                            "bFnIjGJpf9t"
                                        ] ?? ""
                                    ],
                            },
                            multiple: true,
                        },
                    };
                }
                return e;
            });
        });
    }, [displayInstance?.attributesObject?.["bFnIjGJpf9t"]]);

    return (
        <div className="flex flex-col overflow-auto px-10 gap-4">
            <pre>
                {JSON.stringify(displayInstance?.attributesObject, null, 2)}
            </pre>
            {currentAttributes.map(
                ({
                    trackedEntityAttribute: {
                        optionSetValue,
                        valueType,
                        id,
                        optionSet,
                        name,
                        displayFormName,
                        multiple,
                    },
                }) => {
                    const val = (displayInstance?.attributesObject ?? {})[id];
                    return (
                        <div className="flex gap-2 items-center" key={id}>
                            <div className="w-1/3 text-wrap text-right">
                                {`${displayFormName || name}`}({id})
                            </div>
                            <div className="w-2/3 flex gap-2 items-center">
                                <div>:</div>
                                {optionSetValue ? (
                                    <Select
                                        style={{ width: "100%" }}
                                        size="large"
                                        showSearch
                                        placeholder="Select a person"
                                        mode={multiple ? "multiple" : undefined}
                                        value={
                                            multiple && val
                                                ? val.split(",")
                                                : val
                                        }
                                        filterOption={(input, option) =>
                                            (option?.label ?? "")
                                                .toLowerCase()
                                                .includes(input.toLowerCase())
                                        }
                                        options={optionSet?.options?.map(
                                            ({ code, name }) => ({
                                                label: name,
                                                value: code,
                                            }),
                                        )}
                                        onChange={(value) =>
                                            onChange(
                                                isArray(value)
                                                    ? value.join(",")
                                                    : value,
                                                id,
                                            )
                                        }
                                    />
                                ) : (
                                    formElements[valueType]?.({
                                        value: (displayInstance?.attributesObject ??
                                            {})[id],
                                        onChange: (value) =>
                                            onChange(value, id),
                                        onBlur: (value) => onBlur(value, id),
                                        optionSetValue,
                                        optionSet,
                                    })
                                )}
                            </div>
                        </div>
                    );
                },
            )}
        </div>
    );
}

import React, { useCallback, useMemo } from "react";
import { DisplayInstance, ProgramTrackedEntityAttribute } from "@/interfaces";
import { rules } from "@/utils/utils";
import { Select } from "antd";
import { IndexableType, Table } from "dexie";
import { useLiveQuery } from "dexie-react-hooks";
import { isArray } from "lodash";
import { formElements } from "./form-elements";

const FormElement = React.memo(
    ({
        attribute,
        displayInstance,
        onChange,
    }: {
        attribute: ProgramTrackedEntityAttribute["trackedEntityAttribute"];
        displayInstance: Partial<DisplayInstance> | undefined;
        onChange: (value: string, dataElement: string) => void;
    }) => {
        const { optionSetValue, valueType, id, optionSet, multiple } =
            attribute;
        const val = (displayInstance?.attributesObject ?? {})[id];

        if (optionSetValue) {
            return (
                <Select
                    style={{ width: "100%" }}
                    size="large"
                    showSearch
                    placeholder="Select a person"
                    mode={multiple ? "multiple" : undefined}
                    value={multiple && val ? val.split(",") : val}
                    filterOption={(input, option) =>
                        (option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                    }
                    options={optionSet?.options?.map(({ code, name }) => ({
                        label: name,
                        value: code,
                    }))}
                    onChange={(value) =>
                        onChange(isArray(value) ? value.join(",") : value, id)
                    }
                />
            );
        }

        const Element = formElements[valueType];
        return Element ? (
            <Element
                value={(displayInstance?.attributesObject ?? {})[id]}
                onChange={(value) => onChange(value, id)}
                onBlur={() => {}}
                optionSetValue={optionSetValue}
                optionSet={optionSet}
            />
        ) : null;
    },
);

const RegistrationForm: React.FC<{
    program: string;
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    table: Table<Partial<DisplayInstance>, IndexableType>;
}> = React.memo(({ table, programTrackedEntityAttributes }) => {
    const displayInstance = useLiveQuery(() => table.limit(1).first());

    const currentAttributes = useMemo(
        () =>
            programTrackedEntityAttributes.map((e) => {
                if (e.trackedEntityAttribute.id === "mWyp85xIzXR") {
                    const type =
                        displayInstance?.attributesObject?.["bFnIjGJpf9t"] ??
                        "";
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
            }),
        [
            programTrackedEntityAttributes,
            displayInstance?.attributesObject?.["bFnIjGJpf9t"],
        ],
    );

    const onChange = useCallback(
        (value: string, dataElement: string) => {
            if (displayInstance) {
                table.put({
                    ...displayInstance,
                    attributesObject: {
                        ...displayInstance.attributesObject,
                        [dataElement]: value,
                    },
                });
            }
        },
        [displayInstance, table],
    );

    return (
        <div className="flex flex-col overflow-auto px-10 gap-4">
            {currentAttributes.map(({ trackedEntityAttribute }) => (
                <div
                    className="flex gap-2 items-center"
                    key={trackedEntityAttribute.id}
                >
                    <div className="w-1/3 text-wrap text-right">
                        {`${trackedEntityAttribute.displayFormName || trackedEntityAttribute.name}`}
                    </div>
                    <div className="w-2/3 flex gap-2 items-center">
                        <div>:</div>
                        <FormElement
                            attribute={trackedEntityAttribute}
                            displayInstance={displayInstance}
                            onChange={onChange}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
});

export default RegistrationForm;

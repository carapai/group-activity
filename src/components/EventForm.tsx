import FieldInfo from "@/components/FieldInfo";
import { getZodValidator } from "@/utils/utils";
import { useForm } from "@tanstack/react-form";
import {
    useLoaderData,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";
import { Button, DatePicker, Input, Select } from "antd";
import dayjs from "dayjs";
import { DataValue, Event } from "@/interfaces";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { fromPairs } from "lodash";
import { db } from "@/db";
import { api } from "@/utils/dhis2";

type EventElement =
    | "Ii7gEE4702q"
    | "M3m1kAi1kCQ"
    | "NgxXNpQLkxE"
    | "iF10JwHOq5N"
    | "qgikW8oSfNe"
    | "uSJnyqc8vTQ"
    | "upy3rZwSmdn";

export default function EventForm() {
    const { programStages } = useLoaderData({
        from: "/tracker/$program",
    });
    const { dataValues, occurredAt, ...otherFields } = useLoaderData({
        from: "/tracker/$program/form",
    });
    const { ou } = useSearch({
        from: "/tracker/$program/form",
    });
    const { program } = useParams({
        from: "/tracker/$program/form",
    });

    const { optionGroups } = useLoaderData({
        from: "/tracker",
    });
    const navigate = useNavigate({ from: "/tracker/$program/form" });

    const allValues: Record<string, string> = fromPairs(
        dataValues?.map(({ value, dataElement }) => [dataElement, value]) ?? []
    );
    const form = useForm({
        defaultValues: {
            Ii7gEE4702q: allValues["Ii7gEE4702q"],
            M3m1kAi1kCQ: allValues["M3m1kAi1kCQ"],
            NgxXNpQLkxE: allValues["NgxXNpQLkxE"],
            iF10JwHOq5N: allValues["iF10JwHOq5N"],
            qgikW8oSfNe: allValues["qgikW8oSfNe"],
            uSJnyqc8vTQ: allValues["uSJnyqc8vTQ"],
            upy3rZwSmdn: allValues["upy3rZwSmdn"],
        },
        onSubmit: async ({ value }) => {
            const { iF10JwHOq5N } = value;
            const currentDataValues: Array<Partial<DataValue>> = Object.entries(
                {
                    ...allValues,
                    ...value,
                }
            ).map(([dataElement, value]) => ({ dataElement, value }));
            const eventData: Partial<Event> = {
                occurredAt: occurredAt || iF10JwHOq5N,
                orgUnit: ou,
                programStage: programStages[0].id,
                program,
                ...otherFields,
            };

            await api.post("api/tracker", {
                events: [{ ...eventData, dataValues: currentDataValues }],
            });
            await db.currentEvent.clear();
            await db.currentEvent.put({
                ...eventData,
                values: { ...allValues, ...value },
            });

            navigate({
                to: "/entities/$stage",
                search: { program, event: eventData.event },
                params: { stage: programStages[0].id },
            });
        },
        validatorAdapter: zodValidator,
    });
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }}
            className="flex flex-col gap-2"
        >
            {programStages[0].programStageDataElements.map(
                ({
                    dataElement: {
                        id,
                        name,
                        valueType,
                        optionSetValue,
                        optionSet,
                    },
                    compulsory,
                }) => {
                    return (
                        <div key={id}>
                            <form.Field
                                name={id as EventElement}
                                validators={{
                                    onChange: getZodValidator(
                                        valueType,
                                        compulsory
                                    ),
                                }}
                                children={(field) => {
                                    if (optionSetValue) {
                                        return (
                                            <div className="flex flex-col gap-1">
                                                <label htmlFor={field.name}>
                                                    {name}
                                                </label>
                                                <Select
                                                    options={optionSet?.options.map(
                                                        ({ code, name }) => ({
                                                            label: name,
                                                            value: code,
                                                        })
                                                    )}
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(e)
                                                    }
                                                />
                                                <FieldInfo field={field} />
                                            </div>
                                        );
                                    }
                                    if (valueType === "DATE") {
                                        return (
                                            <div className="flex flex-col gap-1">
                                                <label htmlFor={field.name}>
                                                    {name}
                                                </label>
                                                <DatePicker
                                                    id={field.name}
                                                    format={{
                                                        format: "YYYY-MM-DD",
                                                    }}
                                                    value={
                                                        field.state.value
                                                            ? dayjs(
                                                                  field.state
                                                                      .value
                                                              )
                                                            : null
                                                    }
                                                    onChange={(date) => {
                                                        field.handleChange(
                                                            date?.format(
                                                                "YYYY-MM-DD"
                                                            )
                                                        );
                                                    }}
                                                    onBlur={field.handleBlur}
                                                />
                                                <FieldInfo field={field} />
                                            </div>
                                        );
                                    }
                                    if (id === "NgxXNpQLkxE") {
                                        return (
                                            <div className="flex flex-col gap-1">
                                                <label htmlFor={field.name}>
                                                    {name}
                                                </label>
                                                <Select
                                                    options={optionGroups.map(
                                                        ({ id, name }) => ({
                                                            label: name,
                                                            value: id,
                                                        })
                                                    )}
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(e)
                                                    }
                                                />
                                                <FieldInfo field={field} />
                                            </div>
                                        );
                                    }
                                    return (
                                        <div className="flex flex-col gap-1">
                                            <label htmlFor={field.name}>
                                                {name}
                                            </label>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                            <FieldInfo field={field} />
                                        </div>
                                    );
                                }}
                            />
                        </div>
                    );
                }
            )}
            <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting]) => (
                    <div>
                        {" "}
                        <Button htmlType="submit" disabled={!canSubmit}>
                            {isSubmitting ? "..." : "Submit"}
                        </Button>
                    </div>
                )}
            />
        </form>
    );
}

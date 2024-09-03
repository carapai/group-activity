import { db } from "@/db";
import { EventDisplay, ProgramStage } from "@/interfaces";
import { api } from "@/utils/dhis2";
import { useState } from "react";
import { formElements } from "./form-elements";

const updateEvent = (
    event: EventDisplay,
    dataElement: string,
    value: string,
) => {
    const search = event.dataValues?.filter(
        (dv) => dv.dataElement === dataElement,
    );
    if (search && search.length > 0) {
        return {
            ...event,
            dataValues: event.dataValues?.map((dv) => {
                if (dv.dataElement === dataElement) {
                    return { ...dv, value };
                }
                return dv;
            }),
        };
    }
    return {
        ...event,
        dataValues: [...(event?.dataValues ?? []), { dataElement, value }],
    };
};

export default function DynamicEventForm({
    programStage,
    event,
}: {
    programStage: ProgramStage | undefined;
    event: EventDisplay;
}) {
    const [values, setValues] = useState<Record<string, string>>(event.values);
    const onChange = (value: string, dataElement: string) => {
        setValues((prev) => ({ ...prev, [dataElement]: value }));
    };

    const onBlur = async (value: string, dataElement: string) => {
        const instance = await db.instances
            .where({ trackedEntity: event.trackedEntity })
            .first();

        const updatedEvent = updateEvent(event, dataElement, value);
        const enrollments =
            instance?.enrollments?.map((e) => {
                if (e.enrollment === event.enrollment) {
                    return {
                        ...e,
                        events: e?.events?.map((currentEvent) => {
                            if (currentEvent.event === event.event) {
                                return updatedEvent;
                            }
                            return currentEvent;
                        }),
                    };
                }
                return e;
            }) ?? [];

        const updatedInstance = { ...instance, enrollments };
        await db.instances.put(updatedInstance);
        const { values, ...previousEvent } = updatedEvent;
        await api.post(
            "api/tracker",
            {
                events: [previousEvent],
            },
            { params: { async: false } },
        );
    };
    return (
        <div className="max-w-[900px] flex flex-col h-[900px] overflow-auto px-10 gap-4">
            {programStage?.programStageDataElements.map(
                ({ dataElement, optionSetValue, optionSet }) => {
                    return (
                        <div
                            className="flex gap-2 items-center"
                            key={dataElement.id}
                        >
                            <div className="w-1/3 text-wrap text-right">
                                {`${dataElement.formName}`}
                            </div>
                            <div className="w-2/3 flex gap-2 items-center">
                                <div>:</div>
                                {formElements[dataElement.valueType]({
                                    value: values[dataElement.id],
                                    onChange: (value) =>
                                        onChange(value, dataElement.id),
                                    onBlur: (value) =>
                                        onBlur(value, dataElement.id),
                                    optionSetValue,
                                    optionSet,
                                })}
                            </div>
                        </div>
                    );
                },
            )}
        </div>
    );
}

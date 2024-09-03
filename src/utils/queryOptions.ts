import { db } from "@/db";
import {
    DisplayInstance,
    Event,
    EventDisplay,
    Events,
    Instance,
    Instances,
    Option,
    OptionGroup,
    OrgUnit,
    OrgUnits,
    Program,
    ProgramStage,
    Relationship,
} from "@/interfaces";
import { queryOptions } from "@tanstack/react-query";
import { fromPairs } from "lodash";
import { getDHIS2Resource } from "./dhis2";
import { Key } from "react";

const fetchOrganisationUnits = async (orgUnit: string) => {
    const totalIn = await db.organisations.count();
    if (totalIn > 0) {
        const units = await db.organisations.toArray();
        return units;
    } else {
        await db.currentOu.put({ id: 1, value: orgUnit });
        let page = 1;
        let size = 1;
        let all: OrgUnit[] = [];
        while (size > 0) {
            const data = await getDHIS2Resource<OrgUnits | OrgUnit>({
                resource: `organisationUnits/${orgUnit}.json`,
                params: {
                    fields: "id~rename(key),name~rename(title),leaf~rename(isLeaf),parent,path",
                    page: String(page),
                    includeDescendants: "true",
                },
            });

            if ("organisationUnits" in data) {
                all = all.concat(data.organisationUnits);
                page += 1;
            } else {
                size = 0;
            }
        }
        const processedAll = all.map((a) => {
            if (typeof a.parent === "object")
                return { ...a, parent: a.parent.id, value: String(a.key) };
            return { ...a, value: String(a.key) };
        });
        await db.organisations.bulkPut(processedAll);
        return processedAll;
    }
};

const getApps = async () => {
    if (process.env.NODE_ENV === "production") {
        const { modules } = await getDHIS2Resource<{
            modules: Array<{
                name: string;
                namespace: string;
                defaultAction: string;
                displayName: string;
                icon: string;
                description: string;
            }>;
        }>({
            resource: "dhis-web-commons/menu/getModules.action",
            includeApi: false,
        });
        return modules;
    }
    return [];
};

export const firstQueryOptions = queryOptions({
    queryKey: ["first"],
    queryFn: async () => {
        const { dataViewOrganisationUnits } = await getDHIS2Resource<{
            dataViewOrganisationUnits: Array<OrgUnit>;
        }>({
            resource: "me.json",
            params: {
                fields: "dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf]",
            },
        });

        return String(dataViewOrganisationUnits[0].key);
    },
});

export const initialQueryOptions = queryOptions({
    queryKey: ["initial"],
    queryFn: async () => {
        const { dataViewOrganisationUnits } = await getDHIS2Resource<{
            dataViewOrganisationUnits: Array<OrgUnit>;
        }>({
            resource: "me.json",
            params: {
                fields: "dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf]",
            },
        });
        const { programs } = await getDHIS2Resource<{
            programs: Array<{
                id: string;
                name: string;
                registration: boolean;
                trackedEntityType: { id: string };
            }>;
        }>({
            resource: "programs.json",
            params: {
                fields: "id,name,registration,trackedEntityType",
                paging: "false",
            },
        });
        const { optionGroups } = await getDHIS2Resource<{
            optionGroups: OptionGroup[];
        }>({
            resource: "optionGroups.json",
            params: {
                fields: "id,name,options[id,name,code]",
                paging: "false",
            },
        });
        const organisations = await fetchOrganisationUnits(
            String(dataViewOrganisationUnits[0].key),
        );
        await db.optionGroups.bulkPut(optionGroups);
        const unit = await db.currentOu.get({ id: 1 });
        return { optionGroups, organisations, programs, ou: unit?.value ?? "" };
    },
});

export const appsQueryOptions = queryOptions({
    queryKey: ["apps"],
    queryFn: async () => {
        return getApps();
    },
});

export const activitiesQueryOptions = queryOptions({
    queryKey: ["activities"],
    queryFn: async () => {
        const { instances } = await getDHIS2Resource<Events>({
            resource: "tracker/events.json",
            params: {
                ouMode: "ALL",
                programStage: "dBwrot7S420",
            },
        });
        return instances;
    },
});
export const instancesQueryOptions = ({
    ou,
    program,
    page,
    pageSize,
}: {
    ou: string;
    program: string;
    page: number;
    pageSize: number;
}) => {
    return queryOptions({
        queryKey: ["instances", ou, program, page, pageSize],
        queryFn: async () => {
            const { instances, total } = await getDHIS2Resource<Instances>({
                resource: "tracker/trackedEntities.json",
                params: {
                    ouMode: "DESCENDANTS",
                    program,
                    orgUnit: ou,
                    page,
                    pageSize,
                    totalPages: "true",
                    fields: "trackedEntity,trackedEntityType,createdAt,updatedAt,orgUnit,inactive,deleted,attributes[attribute,value],enrollments[enrollment]",
                },
            });
            const processed: Array<DisplayInstance> = instances.map(
                ({ attributes, enrollments, ...rest }) => ({
                    ...rest,
                    attributesObject: fromPairs(
                        attributes
                            .concat(
                                enrollments.flatMap(
                                    ({ attributes }) => attributes ?? [],
                                ),
                            )
                            .map(({ value, attribute }) => [attribute, value]),
                    ),
                    attributes,
                    firstEnrollment:
                        enrollments.length > 0 ? enrollments[0].enrollment : "",
                }),
            );
            return { processed, total };
        },
    });
};

export const programQueryOptions = (program: string) =>
    queryOptions({
        queryKey: ["programs", program],
        queryFn: async () => {
            return getDHIS2Resource<Program>({
                resource: `programs/${program}.json`,
                params: {
                    fields: "id,name,registration,programType,selectIncidentDatesInFuture,selectEnrollmentDatesInFuture,incidentDateLabel,enrollmentDateLabel,organisationUnits[id,name],programTrackedEntityAttributes[id,name,mandatory,valueType,displayInList,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,generated,pattern,unique,valueType,orgunitScope,optionSetValue,displayFormName,optionSet[options[code,name]]]],programStages[id,name,repeatable,sortOrder,programStageDataElements[compulsory,dataElement[id,name,formName,optionSetValue,valueType,optionSet[options[code,name]]]]]",
                    paging: "false",
                },
            });
        },
    });

export const entityQueryOptions = ({
    tei,
    program,
}: {
    tei?: string;
    program: string;
}) => {
    return queryOptions({
        queryKey: ["entity", tei ?? "", program],
        queryFn: async () => {
            const { programStages } = await getDHIS2Resource<{
                programStages: ProgramStage[];
            }>({
                resource: `programs/${program}/programStages.json`,
                params: {
                    fields: "id,name,repeatable,programStageDataElements[dataElement[id,valueType,formName,name]]",
                },
            });
            await db.instances.clear();

            if (tei) {
                const instance = await getDHIS2Resource<Instance>({
                    resource: `tracker/trackedEntities/${tei}.json`,
                    params: {
                        fields: "*",
                    },
                });
                await db.instances.put(instance);
                return { instance, programStages };
            }
            return { programStages };
        },
    });
};

export const trackedEntitiesQueryOptions = (
    program: string,
    trackedEntities: Key[],
) => {
    return queryOptions({
        queryKey: ["tracked-entities-by-id", program, ...trackedEntities],
        queryFn: async () => {
            let currentInstances: Instances = {
                instances: [],
                page: 1,
                pageSize: 50,
                total: 50,
                pageCount: 1,
            };
            if (trackedEntities.length > 0 && program) {
                const data = await getDHIS2Resource<Instances>({
                    resource: "tracker/trackedEntities.json",
                    params: {
                        program,
                        trackedEntity: trackedEntities.join(";"),
                        fields: "*",
                    },
                });
                currentInstances = data;
            }
            return currentInstances.instances;
        },
    });
};

export const trackedEntityQueryOptions = ({
    trackedEntity,
    program,
}: {
    trackedEntity: string;
    program: string;
}) => {
    return queryOptions({
        queryKey: ["tracked-entity", trackedEntity, program],
        queryFn: async () => {
            const instance = await getDHIS2Resource<Instance>({
                resource: `tracker/trackedEntities/${trackedEntity}.json`,
                params: {
                    fields: "*",
                    program,
                },
            });
            return instance;
        },
    });
};

export const programStageQueryOptions = ({
    enrollment,
    programStage,
    tei,
    event,
    program,
    session,
}: {
    tei?: string;
    enrollment?: string;
    event?: string;
    programStage: string;
    program: string;
    session?: string;
}) => {
    const queryKey = [
        "events",
        program,
        programStage,
        tei ?? "",
        enrollment ?? "",
        event ?? "",
        session ?? "",
    ];
    return queryOptions({
        queryKey,
        queryFn: async () => {
            let response: {
                events: EventDisplay[];
                sessions: Option[];
                attendances: string[];
            } = {
                sessions: [],
                events: [],
                attendances: [],
            };
            if (session) {
                const firstGroup = await db.optionGroups
                    .where({ id: session })
                    .first();

                if (firstGroup) {
                    response.sessions = firstGroup.options;
                }
            }
            if (tei && enrollment) {
                const instance = await db.instances
                    .where({ trackedEntity: tei })
                    .first();
                if (instance && instance.enrollments) {
                    const events = instance.enrollments.flatMap((e) => {
                        if (
                            e.enrollment &&
                            e.events &&
                            enrollment === e.enrollment
                        ) {
                            return e.events.flatMap((event) => {
                                if (
                                    event.programStage &&
                                    event.programStage === programStage
                                ) {
                                    if (event.dataValues) {
                                        const values = fromPairs(
                                            event.dataValues.map(
                                                ({ dataElement, value }) => [
                                                    dataElement,
                                                    value,
                                                ],
                                            ),
                                        );
                                        return { ...event, values };
                                    }

                                    return { ...event, values: {} };
                                }
                                return [];
                            });
                        }
                        return [];
                    });
                    response.events = events;
                }
            } else if (event) {
                console.log("Are we here now");
                const currentEvent = await db.currentEvent
                    .where({ event })
                    .toArray();

                response.events = currentEvent;
                const { instances } = await getDHIS2Resource<Events>({
                    resource: "tracker/events.json",
                    params: {
                        fields: "*",
                        filter: `qgikW8oSfNe:eq:${event}`,
                        programStage: "EVkAS8LJNbO",
                        skipPaging: "true",
                    },
                });
                db.sessions.clear();
                db.sessions.bulkPut(instances);
            }
            return response;
        },
    });
};

export const eventsQueryOptions = ({
    ou,
    program,
}: {
    ou: string;
    program: string;
}) => {
    return queryOptions({
        queryKey: ["events", program, ou],
        queryFn: async () => {
            const { instances } = await getDHIS2Resource<Events>({
                resource: "tracker/events.json",
                params: {
                    ouMode: "DESCENDANTS",
                    program,
                    orgUnit: ou,
                },
            });
            const processed: EventDisplay[] = instances.map(
                ({ relationships, notes, dataValues, ...rest }) => ({
                    ...rest,
                    values: fromPairs(
                        dataValues.map(({ value, dataElement }) => [
                            dataElement,
                            value,
                        ]),
                    ),
                }),
            );
            return processed;
        },
    });
};

export const eventQueryOptions = ({ event }: { event: string }) => {
    return queryOptions({
        queryKey: ["events", event],
        queryFn: async () => {
            const currentEvent = await db.event.where({ event }).first();
            if (currentEvent) {
                return currentEvent;
            }
            const eventInstance: Partial<Event> = { event };
            return eventInstance;
        },
    });
};

export const relationshipOptions = ({
    relationships,
}: {
    relationships: Relationship[];
}) => {
    return queryOptions({
        queryKey: ["rel", ...relationships.map((r) => r.relationship)],
        queryFn: async () => {
            // const { instances } = await getDHIS2Resource<Events>({
            //     resource: "tracker/relationships.json",
            //     params: {
            //         programStage: "EVkAS8LJNbO",
            //         skipPaging: "true",
            //     },
            // });
            return relationships;
        },
    });
};

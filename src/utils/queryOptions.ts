import { db } from "@/db";
import {
    DisplayInstance,
    EventDisplay,
    Events,
    Instance,
    Instances,
    OptionGroup,
    OrgUnit,
    Program,
    Relationship,
    Relationships,
    SearchCriteria,
} from "@/interfaces";
import { queryOptions } from "@tanstack/react-query";
import { IndexableType, Table } from "dexie";
import { fromPairs, isEmpty } from "lodash";
import { getDHIS2Resource } from "./dhis2";

export const sessions: Record<string, string> = {
    "VSLA Methodology": "XQ3eQax0uIk",
    "VSLA TOT": "qEium1Lrsc0",
    "VSLA Saving and Borrowing": "ZOAmd05j2t9",
    "Financial Literacy": "LUR9gZUkcrr",
    "SPM Training": "EYMKGdEeniO",
    "Bank Linkages": "gmEcQwHbivM",
    SINOVUYO: "ptI9Geufl7R",
    "MOE Journeys Plus": "HkuYbbefaEM",
    "MOH Journeys curriculum": "P4tTIlhX1yB",
    "No means No sessions (Boys)": "WuPXlmvSfVJ",
    "No means No sessions (Boys) New Curriculum": "TIObJloCVdC",
    "No means No sessions (Girls)": "okgcyLQNVFe",
    ECD: "QHaULS891IF",
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
export const initialQueryOptions = queryOptions({
    queryKey: ["initial"],
    queryFn: async () => {
        const { organisationUnits } = await getDHIS2Resource<{
            organisationUnits: Array<{
                id: string;
                name: string;
                leaf: boolean;
                parent: { id: string };
            }>;
        }>({
            resource: "me.json",
            params: {
                fields: "organisationUnits[id,name,leaf,parent]",
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

        const units = organisationUnits.map(({ id, name, leaf, parent }) => {
            let current: OrgUnit = {
                id,
                title: name,
                isLeaf: leaf,
                value: id,
                key: id,
            };

            if (parent && parent.id) {
                current = {
                    ...current,
                    pId: parent.id,
                };
            }
            return current;
        });
        await db.organisations.bulkPut(units);

        await db.optionGroups.bulkPut(optionGroups);
        return { optionGroups, programs, ou: units[0].value };
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
            await db.activities.clear();
            await db.activities.bulkPut(processed);
            return { processed, total };
        },
    });
};

export const programQueryOptions = (program: string) =>
    queryOptions({
        queryKey: ["programs", program],
        queryFn: async () => {
            const currentProgram = await getDHIS2Resource<Program>({
                resource: `programs/${program}.json`,
                params: {
                    fields: "id,name,registration,programType,selectIncidentDatesInFuture,selectEnrollmentDatesInFuture,incidentDateLabel,enrollmentDateLabel,trackedEntityType[id],organisationUnits[id,name],programTrackedEntityAttributes[id,name,mandatory,valueType,displayInList,sortOrder,allowFutureDate,trackedEntityAttribute[id,name,generated,pattern,unique,valueType,orgunitScope,optionSetValue,displayFormName,optionSet[options[code,name]]]],programStages[id,name,repeatable,sortOrder,programStageDataElements[compulsory,dataElement[id,name,formName,optionSetValue,valueType,optionSet[options[code,name]]]]]",
                    paging: "false",
                },
            });
            return currentProgram;
        },
    });

export const availableSessionsQueryOptions = (sessionValues: string) => {
    const allSessions = sessionValues.split(",");
    return queryOptions({
        queryKey: ["available-sessions", ...allSessions],
        queryFn: async () => {
            const foundSessions = await Promise.all(
                allSessions.flatMap((s) => {
                    if (sessions[s]) {
                        return getDHIS2Resource<{
                            options: Array<{
                                id: string;
                                name: string;
                                code: string;
                            }>;
                        }>({
                            resource: `optionGroups/${sessions[s]}.json`,
                            params: {
                                fields: "options[id,name,code]",
                            },
                        });
                    }
                    return [];
                }),
            );
            return fromPairs(
                foundSessions.map(({ options }, index) => [
                    allSessions[index],
                    options,
                ]),
            );
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
            const displayInstance = {
                ...instance,
                attributesObject: fromPairs(
                    instance.attributes.map(({ value, attribute }) => [
                        attribute,
                        value,
                    ]),
                ),

                firstEnrollment: instance.enrollments?.[0].enrollment,
            };
            const allActivityDateEvents = instance.enrollments.flatMap(
                ({ events }) => {
                    if (events) {
                        return events.flatMap(({ event, programStage }) => {
                            if (programStage === "RN59JuJzecP" && event) {
                                return event;
                            }
                            return [];
                        });
                    }
                    return [];
                },
            );

            const relationships = await getDHIS2Resource<Relationships>({
                resource: "tracker/relationships.json",
                params: {
                    trackedEntity,
                    fields: "relationship,relationshipName,relationshipType,from[trackedEntity[trackedEntity,trackedEntityType,orgUnit,attributes[*],enrollments[enrollment,program]]]",
                },
            });

            const participants: DisplayInstance[] =
                relationships.instances.flatMap(({ from }) => {
                    if (from.trackedEntity) {
                        return {
                            ...from.trackedEntity,
                            attributesObject:
                                from.trackedEntity.attributes?.reduce<
                                    Record<string, string>
                                >((acc, { attribute, value }) => {
                                    if (attribute && value) {
                                        acc[attribute] = value;
                                    }
                                    return acc;
                                }, {}),
                            firstEnrollment:
                                from.trackedEntity.enrollments?.[0].enrollment,
                            program:
                                from.trackedEntity.enrollments?.[0].program,
                        };
                    }
                    return [];
                });
            const allActivityDates = await Promise.all(
                allActivityDateEvents.map((event) => {
                    return getDHIS2Resource<Relationships>({
                        resource: `tracker/relationships`,
                        params: {
                            fields: "*",
                            event,
                        },
                    });
                }),
            );

            const sessions = allActivityDateEvents.flatMap((e, index) => {
                const eventSessions = allActivityDates[index];
                const currentSessions: EventDisplay[] =
                    eventSessions.instances.flatMap(
                        ({ from, relationship }) => {
                            if (from.event) {
                                const participant = participants.find(
                                    (p) =>
                                        p.firstEnrollment ===
                                        from.event?.enrollment,
                                );
                                return {
                                    ...from.event,
                                    trackedEntity: participant?.trackedEntity,
                                    values: {
                                        sessionDateEvent: e,
                                        relationship,
                                    },
                                };
                            }
                            return [];
                        },
                    );

                return currentSessions;
            });

            await db.sessions.clear();
            await db.instances.clear();
            await db.participants.clear();
            await db.sessions.bulkPut(sessions);
            await db.participants.bulkPut(participants);
            await db.instances.bulkPut([displayInstance]);
            return { instance, participants, sessions };
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
            return relationships;
        },
    });
};

export const instancesSearchQueryOptions = ({
    ou,
    page,
    pageSize,
    searchCriteria,
    program,
}: {
    ou: string;
    page: number;
    pageSize: number;
    searchCriteria: SearchCriteria;
    program: string;
}) => {
    const searchParams = new URLSearchParams({
        ouMode: "DESCENDANTS",
        program,
        orgUnit: ou,
        page: String(page),
        pageSize: String(pageSize),
        totalPages: "true",
        order: "createdAt:DESC",
        fields: "trackedEntity,trackedEntityType,createdAt,updatedAt,orgUnit,inactive,deleted,attributes[attribute,value],enrollments[enrollment]",
    });

    if (!isEmpty(searchCriteria)) {
        Object.entries(searchCriteria).forEach(([key, value]) => {
            searchParams.append("filter", `${key}:like:${value}`);
        });
    }
    return queryOptions({
        queryKey: [
            "instances-search",
            program,
            ou,
            page,
            pageSize,
            searchCriteria,
        ],
        queryFn: async () => {
            const { instances, total } = await getDHIS2Resource<Instances>({
                resource: `tracker/trackedEntities.json?${searchParams.toString()}`,
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

export const orgUnitQueryOptions = (
    orgUnit: string,
    table: Table<OrgUnit, IndexableType>,
) => {
    return queryOptions({
        queryKey: ["organisations", orgUnit],
        queryFn: async () => {
            const { children } = await getDHIS2Resource<{
                children: Array<{
                    id: string;
                    name: string;
                    leaf: boolean;
                }>;
            }>({
                resource: `organisationUnits/${orgUnit}`,
                params: {
                    fields: "children[id,name,leaf]",
                },
            });

            const organisationUnits = children.map(({ id, name, leaf }) => {
                const current: OrgUnit = {
                    id,
                    title: name,
                    isLeaf: leaf,
                    value: id,
                    key: id,
                    pId: orgUnit,
                };
                return current;
            });
            await table.bulkPut(organisationUnits);
            return "Done";
        },
    });
};

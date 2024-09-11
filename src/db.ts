import Dexie, { Table } from "dexie";
import "dexie-observable";
import {
    DisplayInstance,
    Event,
    EventDisplay,
    OptionGroup,
    OrgUnit,
    Relationship,
} from "./interfaces";
import { api } from "./utils/dhis2";
export class TrackerDexie extends Dexie {
    organisations!: Table<OrgUnit>;
    currentOu!: Table<{ id: number; value: string }>;
    instances!: Table<Partial<DisplayInstance>>;
    currentEvent!: Table<EventDisplay>;
    event!: Table<Partial<Event>>;
    optionGroups!: Table<OptionGroup>;
    sessions!: Table<EventDisplay>;
    participants!: Table<DisplayInstance>;
    activities!: Table<DisplayInstance>;
    constructor() {
        super("tracker");
        this.version(3).stores({
            organisations: "value,key,title",
            currentOu: "id++,value",
            instances: "trackedEntity",
            currentEvent: "event",
            event: "event",
            optionGroups: "id",
            sessions:
                "[event+trackedEntity+values.sessionDateEvent],event,trackedEntity,values.sessionDateEvent",
            participants: "trackedEntity",
            activities: "trackedEntity",
        });
    }
}

export const db = new TrackerDexie();

db.on("changes", (changes) => {
    changes.forEach(async (change) => {
        if (change.table === "sessions" && change.type === 1) {
            const { values, ...event }: EventDisplay = change.obj;
            if (values.relationship === undefined) {
                const relationship: Partial<Relationship> = {
                    relationshipType: "abKzFW92pE4",
                    from: { event: { event: event.event ?? "" } },
                    to: {
                        event: { event: values.sessionDateEvent },
                    },
                };
                await api.post(
                    "api/tracker",
                    {
                        events: [event],
                        relationships: [relationship],
                    },
                    { params: { async: false } },
                );
            }
        } else if (change.table === "sessions" && change.type === 2) {
            const { values, ...event }: EventDisplay = change.obj;
            await api.post(
                "api/tracker",
                {
                    events: [event],
                },
                { params: { async: false } },
            );
        }
    });
});

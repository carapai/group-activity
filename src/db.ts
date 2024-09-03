import Dexie, { Table } from "dexie";
import "dexie-observable";
import {
    DisplayInstance,
    Event,
    EventDisplay,
    OptionGroup,
    OrgUnit,
} from "./interfaces";
import { api } from "./utils/dhis2";

export class TrackerDexie extends Dexie {
    organisations!: Table<OrgUnit>;
    currentOu!: Table<{ id: number; value: string }>;
    instances!: Table<Partial<DisplayInstance>>;
    currentEvent!: Table<EventDisplay>;
    event!: Table<Partial<Event>>;
    optionGroups!: Table<OptionGroup>;
    sessions!: Table<Partial<Event>>;

    constructor() {
        super("tracker");
        this.version(1).stores({
            organisations: "value,key,title",
            currentOu: "id++,value",
            instances: "trackedEntity",
            currentEvent: "event",
            event: "event",
            optionGroups: "id",
            sessions: "&event,[occurredAt+trackedEntity]",
        });
    }
}

export const db = new TrackerDexie();

db.on("changes", (changes) => {
    changes.forEach((change) => {
        if (change.table === "sessions" && change.type === 2) {
            api.post("api/tracker", {
                events: [change.obj],
            });
        }
    });
});

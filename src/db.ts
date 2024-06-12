import Dexie, { Table } from "dexie";
import "dexie-observable";
import { Event, EventDisplay, Instance, OrgUnit } from "./interfaces";

export class TrackerDexie extends Dexie {
    organisations!: Table<OrgUnit>;
    currentOu!: Table<{ id: number; value: string }>;
    instances!: Table<Instance>;
    currentEvent!: Table<EventDisplay>;
    event!: Table<Partial<Event>>;

    constructor() {
        super("tracker");
        this.version(1).stores({
            organisations: "value,key,title",
            currentOu: "id++,value",
            instances: "trackedEntity",
            currentEvent: "event",
        });
        this.version(2).stores({ event: "event" });
    }
}

export const db = new TrackerDexie();

db.on("changes", (changes) => {
    changes.forEach((change) => console.log(change));
});

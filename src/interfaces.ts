import type { TreeDataNode } from "antd";
import { IndexableType, Table } from "dexie";

export interface OrgUnit extends TreeDataNode {
    pId?: string;
    value: string;
    id: string;
    title: string;
    key: string;
    children?: OrgUnit[];
}
export type OrgUnits = {
    organisationUnits: OrgUnit[];
};

export interface Instances {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
    instances: Instance[];
}

export interface Relationships {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
    instances: Relationship[];
}

export interface Instance {
    trackedEntity: string;
    trackedEntityType: string;
    createdAt: string;
    createdAtClient: string;
    updatedAt: string;
    updatedAtClient: string;
    orgUnit: string;
    inactive: boolean;
    deleted: boolean;
    potentialDuplicate: boolean;
    createdBy: CreatedBy;
    updatedBy: CreatedBy;
    relationships: Relationship[];
    attributes: Array<Partial<Attribute>>;
    enrollments: Array<Partial<Enrollment>>;
    programOwners: ProgramOwner[];
}

export interface ProgramOwner {
    orgUnit: string;
    trackedEntity: string;
    program: string;
}

export interface Enrollment {
    enrollment: string;
    createdAt: string;
    createdAtClient: string;
    updatedAt: string;
    updatedAtClient: string;
    trackedEntity: string;
    program: string;
    status: string;
    orgUnit: string;
    orgUnitName: string;
    enrolledAt: string;
    occurredAt: string;
    followUp: boolean;
    deleted: boolean;
    storedBy: string;
    createdBy: CreatedBy;
    updatedBy: CreatedBy;
    events: Array<Partial<Event>>;
    relationships: Relationship[];
    attributes: Attribute[];
    notes: any[];
}

export interface Event {
    event: string;
    status: string;
    program: string;
    programStage: string;
    enrollment: string;
    trackedEntity: string;
    orgUnit: string;
    orgUnitName: string;
    relationships: Relationship[];
    occurredAt: string;
    scheduledAt: string;
    storedBy: string;
    followup: boolean;
    deleted: boolean;
    createdAt: string;
    updatedAt: string;
    attributeOptionCombo: string;
    attributeCategoryOptions: string;
    completedBy?: string;
    completedAt?: string;
    assignedUser: AssignedUser;
    createdBy: CreatedBy;
    updatedBy: CreatedBy;
    dataValues: Array<Partial<DataValue>>;
    notes: any[];
}

export interface DataValue {
    createdAt: string;
    updatedAt: string;
    providedElsewhere: boolean;
    dataElement: string;
    value: string;
    createdBy: CreatedBy2;
    updatedBy: CreatedBy2;
}

export interface CreatedBy2 {
    uid: string;
    username: string;
    firstName?: string;
    surname?: string;
}

export interface AssignedUser {}

export interface Attribute {
    attribute: string;
    displayName: string;
    createdAt: string;
    updatedAt: string;
    storedBy: string;
    valueType: string;
    value: string;
    code?: string;
}

export interface Relationship {
    relationship: string;
    relationshipName: string;
    relationshipType: string;
    createdAt: string;
    updatedAt: string;
    bidirectional: boolean;
    from: From;
    to: From;
}

export interface From {
    trackedEntity?: Partial<Instance>;
    event?: Partial<Event>;
    enrollment?: Partial<Enrollment>;
}

export interface TrackedEntity {
    trackedEntity: string;
    inactive: boolean;
    deleted: boolean;
    potentialDuplicate: boolean;
    attributes: any[];
    programOwners: any[];
}

export interface CreatedBy {
    uid: string;
    username: string;
}

export interface Events {
    page: number;
    pageSize: number;
    total: number;
    pageCount: number;
    instances: Event[];
}

export type DisplayInstance = Partial<
    Instance & {
        attributesObject: { [key: string]: string };
        firstEnrollment: string;
        program: string;
    }
>;

export type EventDisplay = Partial<Event> & {
    values: { [key: string]: string };
};

export type InstanceColumns =
    | "trackedEntity"
    | "trackedEntityType"
    | "createdAt"
    | "createdAtClient"
    | "updatedAt"
    | "updatedAtClient"
    | "orgUnit"
    | "inactive"
    | "deleted"
    | "potentialDuplicate"
    | "createdBy"
    | "updatedBy"
    | "firstEnrollment";

export type EventColumns =
    | "event"
    | "status"
    | "program"
    | "programStage"
    | "enrollment"
    | "trackedEntity"
    | "orgUnit"
    | "orgUnitName"
    | "occurredAt"
    | "scheduledAt"
    | "storedBy"
    | "followup"
    | "deleted"
    | "createdAt"
    | "updatedAt"
    | "attributeOptionCombo"
    | "attributeCategoryOptions"
    | "completedBy"
    | "completedAt";

export interface TrackedEntityType {
    id: string;
}

export interface Program {
    name: string;
    enrollmentDateLabel: string;
    incidentDateLabel: string;
    programType: string;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    registration: boolean;
    id: string;
    organisationUnits: OrganisationUnit[];
    programStages: ProgramStage[];
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    trackedEntityType: TrackedEntityType;
}

export interface ProgramTrackedEntityAttribute {
    name: string;
    displayInList: boolean;
    sortOrder: number;
    mandatory: boolean;
    allowFutureDate: boolean;
    valueType: ValueType;
    id: string;
    trackedEntityAttribute: TrackedEntityAttribute;
}

export interface TrackedEntityAttribute {
    name: string;
    valueType: string;
    unique: boolean;
    generated: boolean;
    pattern: string;
    orgunitScope: boolean;
    displayFormName: string;
    optionSetValue: boolean;
    id: string;
    optionSet?: OptionSet;
    multiple?: boolean;
}

export interface ProgramStage {
    name: string;
    programStageDataElements: ProgramStageDataElement[];
    sortOrder: number;
    id: string;
    repeatable: boolean;
}

export interface ProgramStageDataElement {
    dataElement: DataElement;
    compulsory: boolean;
    optionSetValue: boolean;
    optionSet: { options: Option[] };
}

export interface DataElement {
    name: string;
    formName?: string;
    valueType: ValueType;
    optionSetValue: boolean;
    id: string;
    optionSet?: OptionSet;
}

export interface OptionSet {
    options: Option[];
}

export interface Option {
    code: string;
    name: string;
    id: string;
}

export interface OrganisationUnit {
    name: string;
    id: string;
}

export interface OptionGroup {
    name: string;
    id: string;
    options: Option[];
}

export type ValueType =
    | "TEXT"
    | "LONG_TEXT"
    | "LETTER"
    | "PHONE_NUMBER"
    | "EMAIL"
    | "BOOLEAN"
    | "TRUE_ONLY"
    | "DATE"
    | "DATETIME"
    | "TIME"
    | "NUMBER"
    | "UNIT_INTERVAL"
    | "PERCENTAGE"
    | "INTEGER"
    | "INTEGER_POSITIVE"
    | "INTEGER_NEGATIVE"
    | "INTEGER_ZERO_OR_POSITIVE"
    | "TRACKER_ASSOCIATE"
    | "USERNAME"
    | "COORDINATE"
    | "ORGANISATION_UNIT"
    | "REFERENCE"
    | "AGE"
    | "URL"
    | "FILE_RESOURCE"
    | "IMAGE"
    | "GEOJSON"
    | "MULTI_TEXT";

export interface Beneficiary {
    trackedEntity: string;
    CfpoFtRmK1z: string;
    huFucxA3e5c: string;
    HLKc2AKR9jW: string;
    enrollment: string;
    occurredAt?: string;
}

export interface SearchCriteria {
    [key: string]: string;
}
export type InstanceGenerator = {
    table: Table<Partial<DisplayInstance>, IndexableType>;
    trackedEntityType: string;
    ou: string;
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    defaultValues?: Record<string, string>;
};

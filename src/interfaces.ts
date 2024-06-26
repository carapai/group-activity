import type { TreeDataNode } from "antd";

export interface OrgUnit extends TreeDataNode {
    parent: { id: string } | string;
    path?: string;
    value?: string;
    id?: string;
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
    attributes: Attribute[];
    enrollments: Enrollment[];
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
    events: Event[];
    relationships: any[];
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
    relationships: any[];
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
    trackedEntity: TrackedEntity;
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

export type DisplayInstance = Omit<
    Instance,
    "relationships" | "attributes" | "enrollments" | "programOwners"
> & { attributes: { [key: string]: string }; firstEnrollment: string };

export type EventDisplay = Omit<
    Partial<Event>,
    | "relationships"
    | "dataValues"
    | "notes"
    | "createdBy"
    | "updatedBy"
    | "assignedUser"
> & { values: { [key: string]: string } };

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
// | "assignedUser";
// | "createdBy"
// | "updatedBy";

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
}

export interface ProgramStage {
    name: string;
    programStageDataElements: ProgramStageDataElement[];
    sortOrder: number;
    id: string;
}

export interface ProgramStageDataElement {
    dataElement: DataElement;
    compulsory: boolean;
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

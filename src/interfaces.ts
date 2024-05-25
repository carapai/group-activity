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

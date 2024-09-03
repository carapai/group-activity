import { DisplayInstance } from "@/interfaces";
import { TableProps } from "antd";

export const columns: TableProps<DisplayInstance>["columns"] = [
    {
        title: "Tracked Entity",
        dataIndex: "trackedEntity",
        key: "trackedEntity",
        render: (text) => {
            return text;
        },
    },
    {
        title: "Individual Code",
        dataIndex: "HLKc2AKR9jW",
        key: "name",
        render: (_, record) => {
            return record.attributesObject?.["HLKc2AKR9jW"];
        },
    },
    {
        title: "Name of Beneficiary",
        dataIndex: "huFucxA3e5c",
        key: "age",
        render: (_, record) => {
            return record.attributesObject?.["huFucxA3e5c"];
        },
    },
    {
        title: "Sex",
        dataIndex: "CfpoFtRmK1z",
        key: "address",
        render: (_, record) => {
            return record.attributesObject?.["CfpoFtRmK1z"];
        },
    },
];

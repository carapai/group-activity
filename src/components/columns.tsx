import { DisplayInstance } from "@/interfaces";
import { TableProps } from "antd";

export const columns: TableProps<DisplayInstance>["columns"] = [
    {
        title: "Individual Code",
        dataIndex: "HLKc2AKR9jW",
        key: "HLKc2AKR9jW",
        render: (_, record) => {
            return record.attributesObject?.["HLKc2AKR9jW"];
        },
    },
    {
        title: "Name of Beneficiary",
        dataIndex: "huFucxA3e5c",
        key: "huFucxA3e5c",
        render: (_, record) => {
            return record.attributesObject?.["huFucxA3e5c"];
        },
    },
    {
        title: "Beneficiary Type",
        dataIndex: "l4jlzkYsUoR",
        key: "l4jlzkYsUoR",
        render: (_, record) => {
            return record.attributesObject?.["l4jlzkYsUoR"];
        },
    },
    {
        title: "Sex",
        dataIndex: "CfpoFtRmK1z",
        key: "CfpoFtRmK1z",
        render: (_, record) => {
            return record.attributesObject?.["CfpoFtRmK1z"];
        },
    },
    {
        title: "DOB",
        dataIndex: "N1nMqKtYKvI",
        key: "N1nMqKtYKvI",
        render: (_, record) => {
            return record.attributesObject?.["N1nMqKtYKvI"];
        },
    },
];

export const groupColumns: TableProps<DisplayInstance>["columns"] = [
    {
        title: "Name of Group",
        dataIndex: "rGF7vXI3TEa",
        key: "rGF7vXI3TEa",
        render: (_, record) => record.attributesObject?.["rGF7vXI3TEa"],
    },

    {
        title: "Type of Group",
        dataIndex: "g4TzadrRGdI",
        key: "g4TzadrRGdI",
        render: (_, record) => record.attributesObject?.["g4TzadrRGdI"],
    },

    {
        title: "Name of CBT",
        dataIndex: "ZqXpjmHJbbO",
        key: "ZqXpjmHJbbO",
        render: (_, record) => record.attributesObject?.["ZqXpjmHJbbO"],
    },

    {
        title: "Number of active beneficiaries in Group",
        dataIndex: "bRAvczsVNgq",
        key: "bRAvczsVNgq",
        render: (_, record) => record.attributesObject?.["bRAvczsVNgq"],
    },
];

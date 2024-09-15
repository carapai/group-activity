import { OptionSet } from "@/interfaces";
import { Checkbox, DatePicker, Input, Radio } from "antd";
import dayjs from "dayjs";
import { JSX } from "react";
import DOBComponent from "./DOBComponent";
type InputProps = {
    value: string;
    onChange: (value: string) => void;
    onBlur: (value: string) => void;
    optionSetValue: boolean;
    optionSet?: OptionSet;
};
export const formElements: Record<string, (args: InputProps) => JSX.Element> = {
    TEXT: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    LONG_TEXT: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    LETTER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    PHONE_NUMBER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    EMAIL: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    BOOLEAN: ({ onChange, value, onBlur }: InputProps) => (
        <Radio.Group
            onChange={(e) => {
                onChange(e.target.value);
                onBlur(e.target.value);
            }}
            value={value}
        >
            <Radio value="true">Yes</Radio>
            <Radio value="false">No</Radio>
        </Radio.Group>
    ),
    TRUE_ONLY: ({ onChange, value, onBlur }: InputProps) => (
        <Checkbox
            onChange={(e) => {
                onChange(e.target.value);
                onBlur(e.target.value);
            }}
            checked={value === "true"}
        />
    ),
    DATE: ({ onChange, value, onBlur }: InputProps) => (
        <DatePicker
            onChange={(e) => {
                onChange(e.format("YYYY-MM-DD"));
                onBlur(e.format("YYYY-MM-DD"));
            }}
            value={dayjs(value)}
        />
    ),
    DATETIME: ({ onChange, value, onBlur }: InputProps) => (
        <DatePicker
            onChange={(e) => {
                onChange(e);
                onBlur(e);
            }}
            value={value}
        />
    ),
    TIME: ({ onChange, value, onBlur }: InputProps) => (
        <DatePicker
            onChange={(e) => {
                onChange(e);
                onBlur(e);
            }}
            value={value}
        />
    ),
    AGE: ({ onChange, value, onBlur }: InputProps) => (
        <DOBComponent
            onChange={(e) => {
                if (e) {
                    onChange(e.format("YYYY-MM-DD"));
                    onBlur(e.format("YYYY-MM-DD"));
                }
            }}
            value={dayjs(value)}
        />
    ),
    NUMBER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    UNIT_INTERVAL: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    PERCENTAGE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER_POSITIVE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER_NEGATIVE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    INTEGER_ZERO_OR_POSITIVE: ({ value, onChange, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    TRACKER_ASSOCIATE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    USERNAME: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    COORDINATE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    ORGANISATION_UNIT: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    REFERENCE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    URL: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    FILE_RESOURCE: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    GEOJSON: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
    MULTI_TEXT: ({ onChange, value, onBlur }: InputProps) => (
        <Input
            size="large"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={(e) => onBlur(e.target.value)}
        />
    ),
};

import React, { useState, useEffect, ChangeEvent } from "react";
import { Input, DatePicker, Select } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

const { Option } = Select;

interface DateOfBirthComponentProps {
    onChange: (date: Dayjs | null | undefined) => void;
    value: Dayjs | null | undefined;
}

const DateOfBirthComponent: React.FC<DateOfBirthComponentProps> = ({
    onChange,
    value,
}) => {
    const [age, setAge] = useState<string>("");
    const [yearOfBirth, setYearOfBirth] = useState<string>("");
    const [monthOfBirth, setMonthOfBirth] = useState<string>("");
    const [dayOfBirth, setDayOfBirth] = useState<string>("");
    const updateFields = (
        date: Dayjs | null,
        updateSource: "date" | "age" | "year" | "month" | "day",
    ): void => {
        if (date && date.isValid()) {
            if (updateSource !== "date") onChange(date);
            if (updateSource !== "age")
                setAge(dayjs().diff(date, "year").toString());
            if (updateSource !== "year") setYearOfBirth(date.year().toString());
            if (updateSource !== "month")
                setMonthOfBirth((date.month() + 1).toString());
            if (updateSource !== "day") setDayOfBirth(date.date().toString());
            onChange(date);
        } else {
            if (updateSource !== "date") onChange(null);
            if (updateSource !== "age") setAge("");
            if (updateSource !== "year") setYearOfBirth("");
            if (updateSource !== "month") setMonthOfBirth("");
            if (updateSource !== "day") setDayOfBirth("");
            onChange(null);
        }
    };

    const handleDateChange = (date: Dayjs | null): void => {
        updateFields(date, "date");
    };

    const handleAgeChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const newAge = e.target.value;
        setAge(newAge);
        if (newAge && parseInt(newAge) > 0) {
            const date = dayjs()
                .subtract(parseInt(newAge), "year")
                .startOf("year");
            updateFields(date, "age");
        } else {
            updateFields(null, "age");
        }
    };

    const handleYearChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const year = e.target.value;
        setYearOfBirth(year);
        updateDateFromParts(year, monthOfBirth, dayOfBirth, "year");
    };

    const handleMonthChange = (month: string): void => {
        setMonthOfBirth(month);
        updateDateFromParts(yearOfBirth, month, dayOfBirth, "month");
    };

    const handleDayChange = (day: string): void => {
        setDayOfBirth(day);
        updateDateFromParts(yearOfBirth, monthOfBirth, day, "day");
    };

    const updateDateFromParts = (
        year: string,
        month: string,
        day: string,
        source: "year" | "month" | "day",
    ): void => {
        if (year && month && day) {
            const date = dayjs(
                `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
                "YYYY-MM-DD",
            );
            if (date.isValid()) {
                updateFields(date, source);
            } else {
                updateFields(null, source);
            }
        } else {
            updateFields(null, source);
        }
    };

    const getDaysInMonth = (year: string, month: string): number => {
        if (year && month) {
            return dayjs(`${year}-${month.padStart(2, "0")}`).daysInMonth();
        }
        return 31; // Default to 31 days if year or month is not set
    };

    useEffect(() => {
        // Initialize with current date
        const currentDate = dayjs();
        updateFields(currentDate, "date");
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
            <DatePicker
                value={value}
                onChange={handleDateChange}
                style={{ width: "100%" }}
            />

            <Input
                type="number"
                value={age}
                onChange={handleAgeChange}
                placeholder="Enter age"
            />

            <Input
                type="number"
                value={yearOfBirth}
                onChange={handleYearChange}
                placeholder="Enter year of birth"
            />

            <Select
                style={{ width: "100%" }}
                value={monthOfBirth}
                onChange={handleMonthChange}
                placeholder="Select month of birth"
            >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                    <Option key={month} value={month.toString()}>
                        {dayjs()
                            .month(month - 1)
                            .format("MMM")}
                    </Option>
                ))}
            </Select>

            <Select
                style={{ width: "100%" }}
                value={dayOfBirth}
                onChange={handleDayChange}
                placeholder="Select day of birth"
            >
                {Array.from(
                    { length: getDaysInMonth(yearOfBirth, monthOfBirth) },
                    (_, i) => i + 1,
                ).map((day) => (
                    <Option key={day} value={day.toString()}>
                        {day}
                    </Option>
                ))}
            </Select>
        </div>
    );
};

export default DateOfBirthComponent;

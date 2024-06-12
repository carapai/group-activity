import { OrgUnit, ValueType } from "@/interfaces";
import {
    z,
    ZodBoolean,
    ZodEffects,
    ZodLiteral,
    ZodNumber,
    ZodString,
} from "zod";
const hasSearchTerm = (title: string, name: string) => {
    return title.toLowerCase().includes(name.toLowerCase());
};
export function searchFilter(array: OrgUnit[], name: string) {
    return array.reduce((r: OrgUnit[], { children = [], ...o }) => {
        if (hasSearchTerm(String(o.title), name)) {
            if (children) {
                r.push(Object.assign(o, { children }));
                return r;
            } else {
                r.push(o);
                return r;
            }
        }
        children = searchFilter(children, name);
        if (children.length) {
            r.push(Object.assign(o, { children }));
        }
        return r;
    }, []);
}

export const rules = {
    "1. VSLA Group": [
        {
            code: "VSLA Methodology",
            name: "VSLA Methodology",
            id: "csaOlWgrP0M",
        },
        {
            code: "VSLA TOT",
            name: "VSLA TOT",
            id: "zN3qcA45zFa",
        },
        {
            code: "Financial Literacy",
            name: "Financial Literacy",
            id: "w1LXBcjyGc8",
        },
        {
            code: "SPM Training",
            name: "SPM Training",
            id: "SbY75a4HQ91",
        },
        {
            code: "Bank Linkages",
            name: "Bank Linkages",
            id: "sUWKmNl1LWz",
        },
        {
            code: "VSLA Saving and Borrowing",
            name: "VSLA Saving and Borrowing",
            id: "ZOAmd05j2t9",
        },
    ],
    "2. Sinovuyo": [
        {
            code: "SINOVUYO",
            name: "SINOVUYO",
            id: "SXa1484XcvG",
        },
        {
            code: "Financial Literacy",
            name: "Financial Literacy",
            id: "w1LXBcjyGc8",
        },
    ],
    "3. Journeys Plus": [
        {
            code: "MOE Journeys Plus",
            name: "MOE Journeys Plus",
            id: "qs3EKK4M8wY",
        },
        {
            code: "MOH Journeys curriculum",
            name: "MOH Journeys curriculum",
            id: "g0hJcS2L9GU",
        },
    ],
    "4. NMN": [
        {
            code: "No means No sessions (Boys)",
            name: "No means No sessions (Boys)",
            id: "wCyaM5Z93lZ",
        },
        {
            code: "No means No sessions (Girls)",
            name: "No means No sessions (Girls)",
            id: "QV3TyZXPWgv",
        },
        {
            code: "No means No sessions (Boys) New Curriculum",
            name: "No means No sessions (Boys) New Curriculum",
            id: "b8U0SohW8Qv",
        },
    ],
    "7. Early Childhood Development (ECD)": [
        {
            code: "ECD",
            name: "GAT. Early Childhood Development",
            id: "QHaULS891IF",
        },
    ],
    "5. Stepping Stones": [],
    "6. Other (Specify)": [],
};

export const valueTypes: Record<
    ValueType,
    | ZodString
    | ZodBoolean
    | ZodNumber
    | ZodLiteral<true>
    | ZodEffects<ZodNumber, number, unknown>
> = {
    TEXT: z.string().trim().min(1),
    LONG_TEXT: z.string().trim().min(1),
    LETTER: z.string().trim().length(1),
    PHONE_NUMBER: z.string().trim().min(1),
    EMAIL: z.string().trim().min(1).email(),
    BOOLEAN: z.boolean(),
    TRUE_ONLY: z.literal(true),
    DATE: z.string().regex(/^(\d{4})-(\d{2})-(\d{2})/),
    DATETIME: z
        .string()
        .regex(
            /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/
        ),
    TIME: z.string().regex(/^(\d{2}):(\d{2})/),
    NUMBER: z.preprocess(Number, z.number()),
    UNIT_INTERVAL: z.string().trim().min(1),
    PERCENTAGE: z.preprocess(Number, z.number().int().gte(0).lte(100)),
    INTEGER: z.preprocess(Number, z.number().int()),
    INTEGER_POSITIVE: z.preprocess(Number, z.number().int().positive().min(1)),
    INTEGER_NEGATIVE: z.preprocess(Number, z.number().int().negative()),
    INTEGER_ZERO_OR_POSITIVE: z.preprocess(Number, z.number().int().min(0)),
    TRACKER_ASSOCIATE: z.string().length(11),
    USERNAME: z.string().trim().min(1),
    COORDINATE: z.string().trim().min(1),
    ORGANISATION_UNIT: z.string().length(11),
    REFERENCE: z.string().length(11),
    AGE: z.string().regex(/^(\d{4})-(\d{2})-(\d{2})/),
    URL: z.string().url(),
    FILE_RESOURCE: z.string().trim().min(1),
    IMAGE: z.string().trim().min(1),
    GEOJSON: z.string().trim().min(1),
    MULTI_TEXT: z.string().trim().min(1),
};

export const getZodValidator = (type: ValueType, required: boolean) => {
    const currentZodValidator = valueTypes[type] || z.string();
    if (required) {
        return currentZodValidator;
    }
    return currentZodValidator.optional();
};

import { queryOptions } from "@tanstack/react-query";
import { getDHIS2Resource } from "./dhis2";

console.log(process.env.NODE_ENV);

// const fetchOrganisationUnits = async (orgUnit: string) => {
//     let page = 1;
//     let size = 1;
//     let all: OrgUnit[] = [];
//     while (size > 0) {
//         const data = await getDHIS2Resource<OrgUnits | OrgUnit>({
//             resource: `organisationUnits/${orgUnit}.json`,
//             params: {
//                 fields: "id~rename(key),name~rename(title),leaf~rename(isLeaf),parent,path",
//                 page: String(page),
//                 includeDescendants: "true",
//             },
//         });

//         if ("organisationUnits" in data) {
//             all = all.concat(data.organisationUnits);
//             page += 1;
//         } else {
//             size = 0;
//         }
//     }
//     return all.map((a) => {
//         if (typeof a.parent === "object")
//             return { ...a, parent: a.parent.id, value: String(a.key) };
//         return { ...a, value: String(a.key) };
//     });
// };

const getApps = async () => {
    if (process.env.NODE_ENV === "production") {
        const {
            data: { modules },
        } = await getDHIS2Resource<{
            modules: Array<{
                name: string;
                namespace: string;
                defaultAction: string;
                displayName: string;
                icon: string;
                description: string;
            }>;
        }>({
            resource: "dhis-web-commons/menu/getModules.action",
            includeApi: false,
        });
        return modules;
    }
    return [];
};

export const initialQueryOptions = queryOptions({
    queryKey: ["initial"],
    queryFn: async () => {
        return getApps();
        // const { dataViewOrganisationUnits } = await getDHIS2Resource<{
        //     dataViewOrganisationUnits: Array<OrgUnit>;
        // }>({
        //     resource: "me.json",
        //     params: {
        //         fields: "dataViewOrganisationUnits[id~rename(key),name~rename(title),leaf]",
        //     },
        // });
        // const all = await fetchOrganisationUnits(
        //     String(dataViewOrganisationUnits[0].key)
        // );

        // const { programs } = await getDHIS2Resource<{
        //     programs: Array<{ id: string; name: string }>;
        // }>({ resource: "programs.json" });

        // const { trackedEntityTypes } = await getDHIS2Resource<{
        //     trackedEntityTypes: Array<{ id: string; name: string }>;
        // }>({ resource: "trackedEntityTypes.json" });
        // return {
        //     organisationUnits: all,
        //     programs,
        //     trackedEntityTypes,
        // };
    },
});

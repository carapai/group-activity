import { OrgUnit } from "@/interfaces";
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

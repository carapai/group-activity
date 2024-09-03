import { Relationship } from "@/interfaces";
import { relationshipOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";

export default function Relationships({
    relationships,
}: {
    relationships: Relationship[];
}) {
    const { data } = useSuspenseQuery(relationshipOptions({ relationships }));
    return (
        <div>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}

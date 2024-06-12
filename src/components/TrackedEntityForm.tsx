import { useLoaderData } from "@tanstack/react-router";

export default function TrackedEntityForm() {
    const { programTrackedEntityAttributes } = useLoaderData({
        from: "/tracker/$program",
    });
    return (
        <div>
            <pre>{JSON.stringify(programTrackedEntityAttributes, null, 2)}</pre>
        </div>
    );
}

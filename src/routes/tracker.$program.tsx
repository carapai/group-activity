import OrgUnitTreeSelect from "@/components/ui/OrgUnitTreeSelect";
import { db } from "@/db";
import { TrackerSearchSchema } from "@/schemas/search";
import { programQueryOptions } from "@/utils/queryOptions";
import { generateUid } from "@/utils/uid";
import {
    createFileRoute,
    Outlet,
    useLoaderData,
    useNavigate,
    useSearch,
} from "@tanstack/react-router";
import { Button } from "antd";

export const Route = createFileRoute("/tracker/$program")({
    component: ProgramComponent,
    validateSearch: TrackerSearchSchema,
    loader: (opts) =>
        opts.context.queryClient.ensureQueryData(
            programQueryOptions(opts.params.program)
        ),
});

function ProgramComponent() {
    const navigate = useNavigate({ from: Route.fullPath });
    const { organisationUnits, id, registration } = useLoaderData({
        from: Route.fullPath,
    });
    const { organisations } = useLoaderData({ from: "/tracker" });
    const { ou } = useSearch({ from: Route.fullPath });

    const transition = async (val: string) => {
        await db.currentOu.put({ id: 1, value: val });
        navigate({
            search: (old) => {
                return {
                    ...old,
                    ou: val,
                };
            },
        });
    };

    const addForm = () => {
        navigate({
            to: "/tracker/$program/form",
            params: { program: id },
            search: {
                ou,
                registration,
                event: generateUid(),
            },
        });
    };

    const isDisabled = () =>
        organisationUnits.filter((a) => a.id === ou).length === 0;

    return (
        <div className="p-2">
            <div className="h-[48px] flex flex-row gap-4 items-center">
                <OrgUnitTreeSelect
                    organisationUnits={organisations}
                    onChange={transition}
                    value={ou}
                />
                <Button disabled={isDisabled()} onClick={() => addForm()}>
                    Add
                </Button>
            </div>
            <div className="h-[calc(100vh-96px)] overflow-auto">
                <Outlet />
            </div>
        </div>
    );
}

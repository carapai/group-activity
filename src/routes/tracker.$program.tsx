import OrgUnitSelect from "@/components/ui/OrgUnitSelect";
import { db } from "@/db";
import { ProgramSearchSchema } from "@/schemas/search";
import { programQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
    createFileRoute,
    Outlet,
    useNavigate,
    useParams,
    useSearch,
} from "@tanstack/react-router";

export const Route = createFileRoute("/tracker/$program")({
    component: ProgramComponent,
    validateSearch: ProgramSearchSchema,
    loader: (opts) =>
        opts.context.queryClient.ensureQueryData(
            programQueryOptions(opts.params.program),
        ),
    pendingComponent: () => <div>Loading...</div>,
});

function ProgramComponent() {
    const navigate = useNavigate({ from: Route.fullPath });
    const { program } = useParams({ from: Route.fullPath });
    const { ou, oh } = useSearch({ from: Route.fullPath });
    const transition = async (val: string) => {
        await db.currentOu.put({ id: 1, value: val });
        navigate({
            to: "/tracker/$program/instances",
            search: (old) => {
                return {
                    ...old,
                    ou: val,
                    selectedKeys: undefined,
                    page: 1,
                    pageSize: 10,
                    th: false,
                };
            },
        });
    };
    useSuspenseQuery(programQueryOptions(program));

    return (
        <>
            {(oh === undefined || oh === false) && (
                <div className="h-[48px] flex flex-row gap-4 items-center p-2">
                    <OrgUnitSelect
                        onChange={transition}
                        value={ou}
                        table={db.organisations}
                    />
                </div>
            )}
            <div className="h-[calc(100vh-96px)] overflow-auto">
                <Outlet />
            </div>
        </>
    );
}

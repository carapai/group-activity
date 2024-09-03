import OrgUnitTreeSelect from "@/components/ui/OrgUnitTreeSelect";
import { db } from "@/db";
import { ProgramSearchSchema } from "@/schemas/search";
import { programQueryOptions } from "@/utils/queryOptions";
import {
    createFileRoute,
    Outlet,
    useLoaderData,
    useNavigate,
    useSearch,
} from "@tanstack/react-router";
import useKeyboardShortcut from "use-keyboard-shortcut";

export const Route = createFileRoute("/tracker/$program")({
    component: ProgramComponent,
    validateSearch: ProgramSearchSchema,
    loader: (opts) =>
        opts.context.queryClient.ensureQueryData(
            programQueryOptions(opts.params.program),
        ),
});

function ProgramComponent() {
    const navigate = useNavigate({ from: Route.fullPath });
    const { organisations } = useLoaderData({ from: "/tracker" });
    const { ou, oh } = useSearch({ from: Route.fullPath });

    const transition = async (val: string) => {
        await db.currentOu.put({ id: 1, value: val });
        navigate({
            search: (old) => {
                return {
                    ...old,
                    ou: val,
                    selectedKeys: undefined,
                };
            },
        });
    };

    useKeyboardShortcut(
        ["Shift", "H"],
        () => navigate({ search: (s) => ({ ...s, ph: !s.ph }) }),
        {
            overrideSystem: false,
            ignoreInputFields: false,
            repeatOnHold: true,
        },
    );
    return (
        <>
            {(oh === undefined || oh === false) && (
                <div className="h-[48px] flex flex-row gap-4 items-center p-2">
                    <OrgUnitTreeSelect
                        organisationUnits={organisations}
                        onChange={transition}
                        value={ou}
                    />
                </div>
            )}
            <div className="h-[calc(100vh-96px)] overflow-auto">
                <Outlet />
            </div>
        </>
    );
}

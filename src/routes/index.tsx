import { initialQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export const Route = createFileRoute("/")({
    component: Home,
    loader: ({ context: { queryClient } }) =>
        queryClient.ensureQueryData(initialQueryOptions),
});
function Home() {
    const modules = useSuspenseQuery(initialQueryOptions);
    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="h-[48px] bg-[#2c6693] w-full flex flex-row items-center">
                <div>Logo</div>
                <div className="flex-1 text-right">
                    <Popover>
                        <PopoverTrigger>
                            <svg
                                height="24"
                                viewBox="0 0 24 24"
                                width="24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="m7 16c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1h-2c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm-12-6c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1h-2c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm-12-6c.55228475 0 1 .44771525 1 1v2c0 .55228475-.44771525 1-1 1h-2c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm6 0c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1h-2c-.5522847 0-1-.44771525-1-1v-2c0-.55228475.4477153-1 1-1zm6 0c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1h-2c-.5522847 0-1-.44771525-1-1v-2c0-.55228475.4477153-1 1-1z"
                                    fill="white"
                                    fill-rule="evenodd"
                                />
                            </svg>
                        </PopoverTrigger>
                        <PopoverContent className="mr-1 w-[300px] h-[300px] mt-[8px]">
                            <pre>{JSON.stringify(modules.data)}</pre>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex-1 p-2">
                Testing
                <Outlet />
            </div>
        </div>
    );
}

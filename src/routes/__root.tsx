import { QueryClient } from "@tanstack/react-query";
// import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
// import { TanStackRouterDevtools } from "@tanstack/router-devtools";

// function RouterSpinner() {
//     const isLoading = useRouterState({ select: (s) => s.status === "pending" });

//     return (
//         <Modal
//             centered
//             open={isLoading}
//             footer={null}
//             width="36px"
//             height="36px"
//             closeIcon={null}
//             styles={{
//                 body: {
//                     padding: 0,
//                     margin: 0,
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     fontSize: "24px",
//                     backgroundColor: "none !important",
//                 },
//                 content: { padding: 0, margin: 0 },
//             }}
//         >
//             <Spinner show={isLoading} />
//         </Modal>
//     );
// }

export const Route = createRootRouteWithContext<{
    queryClient: QueryClient;
}>()({
    component: RootComponent,
});
function RootComponent() {
    // const { data } = useSuspenseQuery(appsQueryOptions);
    return (
        <div className="flex flex-col h-screen w-screen">
            <div className="h-[48px] h-min-[48px] h-max-[48px] bg-[#2c6693] w-full flex flex-row items-center">
                {/* <div>Logo</div>
                <div className="flex-1 text-right">
                    <Popover>
                        <PopoverTrigger>
                            
                        </PopoverTrigger>
                        <PopoverContent className="mr-1 w-[300px] h-[300px] mt-[8px]">
                            <pre>{JSON.stringify(data)}</pre>
                        </PopoverContent>
                    </Popover>

                    <svg
                        height="24"
                        viewBox="0 0 24 24"
                        width="24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="m7 16c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1h-2c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm-12-6c.55228475 0 1 .4477153 1 1v2c0 .5522847-.44771525 1-1 1h-2c-.55228475 0-1-.4477153-1-1v-2c0-.5522847.44771525-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm6 0c.5522847 0 1 .4477153 1 1v2c0 .5522847-.4477153 1-1 1h-2c-.5522847 0-1-.4477153-1-1v-2c0-.5522847.4477153-1 1-1zm-12-6c.55228475 0 1 .44771525 1 1v2c0 .55228475-.44771525 1-1 1h-2c-.55228475 0-1-.44771525-1-1v-2c0-.55228475.44771525-1 1-1zm6 0c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1h-2c-.5522847 0-1-.44771525-1-1v-2c0-.55228475.4477153-1 1-1zm6 0c.5522847 0 1 .44771525 1 1v2c0 .55228475-.4477153 1-1 1h-2c-.5522847 0-1-.44771525-1-1v-2c0-.55228475.4477153-1 1-1z"
                            fill="white"
                            fillRule="evenodd"
                        />
                    </svg>
                </div> */}
                <div className={`text-3xl`}>{/* <RouterSpinner /> */}</div>
            </div>

            <div className="h-[calc(100vh-48px)] h-max-[calc(100vh-48px)] h-min-[calc(100vh-48px)]">
                <Outlet />
            </div>

            {/* <ReactQueryDevtools buttonPosition="bottom-right" />
            <TanStackRouterDevtools position="bottom-left" /> */}
        </div>
    );
}

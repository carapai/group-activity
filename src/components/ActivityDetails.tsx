import { DisplayInstance } from "@/interfaces";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { Tabs } from "antd";

import { trackedEntitiesQueryOptions } from "@/utils/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import { fromPairs } from "lodash";
import { Key, useState } from "react";
import Beneficiaries from "./Beneficiaries";
import Sessions from "./Sessions";
export default function ActivityDetails() {
    const data = useLoaderData({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const { ps } = useSearch({
        from: "/tracker/$program/instances/$trackedEntity",
    });
    const navigate = useNavigate({
        from: "/tracker/$program/instances/$trackedEntity",
    });

    const previousInstances = data.relationships.flatMap((e) => {
        if (e.from.trackedEntity) {
            return e.from.trackedEntity.trackedEntity as Key;
        }
        return [];
    });

    const { data: currentData } = useSuspenseQuery(
        trackedEntitiesQueryOptions("RDEklSXCD4C", previousInstances),
    );
    const previous = currentData.map((e) => {
        const attributesObject = fromPairs(
            e.attributes.map(({ attribute, value }) => [attribute, value]),
        );

        return { ...e, attributesObject };
    });

    const [dataSource, setDataSource] =
        useState<Array<DisplayInstance>>(previous);

    const activityDates = data.enrollments.flatMap(({ events }) => {
        if (events) {
            return events.filter(
                ({ programStage }) => programStage === "RN59JuJzecP",
            );
        }
        return [];
    });

    return (
        <div className="p-2">
            <Tabs
                activeKey={ps}
                tabPosition="top"
                onTabClick={(key) =>
                    navigate({
                        search: (s) => ({
                            ...s,

                            ps: key,
                        }),
                    })
                }
                items={[
                    {
                        label: "Beneficiaries",
                        key: "aTZwDRoJnxj",
                        children: (
                            <Beneficiaries
                                dataSource={dataSource}
                                previousInstances={previousInstances}
                                setDataSource={setDataSource}
                            />
                        ),
                    },
                    {
                        label: "Sessions",
                        key: "VzkQBBglj3O",
                        children: (
                            <Sessions
                                dataSource={dataSource}
                                activityDates={activityDates}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
}

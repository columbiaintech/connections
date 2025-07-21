"use server"
import React from "react";
import DashboardDisplay from "@/components/DashboardDisplay";

export default async function Dashboard({searchParams}: { searchParams: Promise<any> }) {
    const resolvedSearchParams = await searchParams;

    return (
        <div className="p-8">
            <DashboardDisplay searchParams={resolvedSearchParams}/>
        </div>
    );
}

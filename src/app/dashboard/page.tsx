"use server"
import React from "react";
import DashboardDisplay from "@/components/DashboardDisplay";

export default async function Dashboard({searchParams}: { searchParams: URLSearchParams }) {
    return (
        <div className="p-8">
            <DashboardDisplay searchParams={searchParams}/>
        </div>
    );
}

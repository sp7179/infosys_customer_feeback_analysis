"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "./components/AdminLayout";

export default function AdminPage() {
    const router = useRouter();

    const [token, setToken] = useState(null);

    useEffect(() => {
        const t = sessionStorage.getItem("ADMIN_TOKEN");
        setToken(t);

        if (!t) {
            router.replace("/admin/login");
        }
    }, [router]);

    if (token === null) return null; // wait for hydration
    if (!token) return null;         // redirect already triggered


    
    return <AdminLayout />;
}

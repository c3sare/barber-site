import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

const Logout = () => {
    const router = useRouter()
    const {data} = useSWR("/api/logout");

    useEffect(() => {
        if(data?.isLoggedIn === false) {
            setTimeout(() => router.push("/admin/login"), 200);
        }
    }, [data, router]);
}

export default Logout;
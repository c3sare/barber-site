import { useRouter } from "next/router";
import useSWR from "swr";

const Logout = () => {
    const router = useRouter()
    const {data} = useSWR("/api/logout");
    if(data?.isLoggedIn === false) router.push("/admin/login");
}

export default Logout;
import { useRouter } from "next/router";
import { useEffect } from "react";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    fetch("/api/logout", {
      method: "POST",
    }).finally(() => {
      router.push("/admin/login");
    });
  }, [router]);
};

export default Logout;

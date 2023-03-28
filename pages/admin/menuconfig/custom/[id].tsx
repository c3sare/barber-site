import { Layout } from "@/componentsAdminPanel/Layout";
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import useSWR from "swr";
import type { Value } from "@react-page/editor";
import { useEffect, useState } from "react";
import CButton from "@/componentsAdminPanel/elements/CButton";
import Link from "next/link";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import PageEditor from "@/componentsAdminPanel/PageEditor";
import Menu from "@/models/Menu";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";

const AdminPanelIndex = ({ permissions = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data, error, isLoading } = useSWR(
    "/api/menu/custom/content/" + router.query.id
  );
  const [value, setValue] = useState<Value | null>(null);

  useEffect(() => {
    setValue(data);
  }, [data]);

  const handleSendContent = () => {
    setLoading(true);
    fetch(`/api/menu/custom/content/${router.query.id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(value),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.log("Wystąpił błąd");
          setLoading(false);
        } else {
          router.push("/admin/menuconfig#edit");
        }
      });
  };

  return (
    <Layout perms={permissions}>
      {!isLoading ? (
        !error ? (
          <>
            <PageEditor value={value} setValue={setValue} loading={loading} />
            <div style={{ textAlign: "center" }}>
              <CButton
                disabled={loading}
                LinkComponent={Link}
                href="/admin/menuconfig#edit"
              >
                Wróć
              </CButton>
              <CLoadingButton
                disabled={loading}
                loading={loading}
                loadingPosition="start"
                startIcon={<SaveIcon />}
                onClick={handleSendContent}
              >
                Zapisz zmiany
              </CLoadingButton>
            </div>
          </>
        ) : (
          <span>Nie znaleziono strony!</span>
        )
      ) : (
        <Loading />
      )}
    </Layout>
  );
};

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, query }) {
    const user = req.session.user;
    await dbConnect();
    const node = await Menu.findOne({
      _id: new Types.ObjectId(query.id as string),
      custom: true,
    });

    if (user?.isLoggedIn !== true || !user?.permissions?.menu || !node) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        permissions: req.session.user?.permissions,
      },
    };
  },
  sessionOptions
);

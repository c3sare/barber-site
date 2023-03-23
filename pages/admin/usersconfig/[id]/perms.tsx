import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";
import perms from "@/lib/permissions";
import { Box, FormControlLabel } from "@mui/material";
import getData from "@/utils/getData";
import CCheckbox from "@/componentsAdminPanel/elements/CCheckBox";

interface Permissions {
  [key: string]: boolean
}

const AdminPanelIndex = ({permissions={}, data}: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {control, handleSubmit, getValues} = useForm<Permissions>();

  const sendData = (data:Permissions) => {
    setLoading(true);
    fetch("/api/users/"+router.query.id+"/perms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
      if(!data.error) {
        router.push("/admin/usersconfig")
      } else {
        console.log("err");
        setLoading(false);
      }
    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    })
  }

  const allPermissions:string[] = Object.keys(perms);

    return (
        <Layout perms={permissions}>
          <h1>Zmiana uprawnień dla użytkownika - {data.login}</h1>
          <form onSubmit={handleSubmit(sendData)} style={{width: "100%", maxWidth: "550px", textAlign: "center", margin: "0 auto"}}>
          <Box>
              {allPermissions.map((perm) => {
                return(
                  <Controller
                    key={perm}
                    control={control}
                    defaultValue={data.permissions[perm]}
                    name={perm}
                    render={({ field: { onChange, onBlur, value, ref, name } }) => (
                      <FormControlLabel
                        label={perms[perm]}
                        disabled={loading}
                        control={
                          <CCheckbox
                            disabled={loading}
                            color="default"
                            onChange={onChange}
                            name={name}
                            onBlur={onBlur}
                            checked={Boolean(value)}
                            inputRef={ref}
                          />
                        }
                      />
                    )}
                  />
                )
              })}
            </Box>
            <CButton disabled={loading} LinkComponent={Link} href="/admin/usersconfig">Wróć</CButton>
            <CLoadingButton disabled={loading} loading={loading} loadingPosition="start" startIcon={<SaveIcon/>} type="submit">
              Zapisz uprawnienia
            </CLoadingButton>
          </form>
        </Layout>
    )
}

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req, query }) {
      const user = req.session.user;

      const request = (await getData("users")).map((item: any) => ({
        login: item.login,
        _id: item._id,
        permissions: item.permissions
      }));

      const data = request.find((item:any) => item._id === query.id);
  
      if (user?.isLoggedIn !== true || !user?.permissions?.users || !data) {
        return {
          notFound: true,
        };
      }
  
      return {
        props: {
          data,
          permissions: user?.permissions,
        },
      };
    },
    sessionOptions
);
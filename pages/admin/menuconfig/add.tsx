import { Layout } from "@/componentsAdminPanel/Layout"
import CButton from "@/componentsAdminPanel/elements/CButton";
import CCheckbox from "@/componentsAdminPanel/elements/CCheckBox";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { Box, Grid, Link } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import { useForm } from "react-hook-form";

const AdminPanelIndex = ({permissions={}}: any) => {
    const {handleSubmit, register, control, formState: {errors}} = useForm();

    const handleSendData = (data:any) => {
        fetch("/api/menu", {
            method: "PUT",
            "headers": {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(data => console.log(data))
    } 

    return (
        <Layout perms={permissions}>
            <form onSubmit={handleSubmit(handleSendData)}>
                <Grid
                  container
                  alignItems="center"
                  direction="column"
                  sx={{ maxWidth: "550px", width: "100%", margin: "0 auto"}}
                >
                    <CTextField
                        label="Tytuł"
                        {...register("title", {
                        pattern: {
                            value: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                            message: "Pole wypełniono nieprawidłowo!"
                        },
                        required: "To pole jest wymagane!",
                        maxLength: {
                            value: 25,
                            message: "Maksymalna długość to 25 znaków!"
                        }
                        })}
                        error={Boolean(errors.title)}
                        helperText={errors.title?.message as string}
                    />
                    <CTextField
                        label="Adres"
                        {...register("slug", {
                          pattern: {
                            value: /^[a-z](-?[a-z])*$/,
                            message: "Pole wypełniono nieprawidłowo!"
                          },
                          required: "To pole jest wymagane!",
                          maxLength: {
                            value: 20,
                            message: "Maksymalna długość to 20 znaków!"
                          }
                        })}
                        error={Boolean(errors.slug)}
                        helperText={errors.slug?.message as string}
                    />
                    <Box>
                        <CButton LinkComponent={Link} href="/admin/menuconfig">Wróć</CButton>
                        <CButton type="submit">Dodaj</CButton>
                    </Box>
                </Grid>
              </form>
        </Layout>
    )
}

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true || user?.permissions?.menu !== true) {
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
import { Grid, Box, Container } from "@mui/material";
import { ReactNode } from "react";
import Head from "next/head";
import style from "../../styles/admin.module.css";

import CTextField from "../../componentsAdminPanel/elements/CTextField";
import CButton from "../../componentsAdminPanel/elements/CButton";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "@/lib/AuthSession/Config";

const Login = () => {
    const router = useRouter();
    const {register, formState: {errors}, handleSubmit} = useForm({});

    const handleSendData = (data:any) => {
        fetch("/api/login", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data)
        }).then(data => data.json())
        .then(data => {
            if(data.isLoggedIn === true) {
                router.push("/admin/")
            }
        });
    };

  return (
    <>
        <Head>
            <title>Panel Administracyjny</title>
        </Head>
        <main className={style.main + " " + style.fullWidth} style={{display: 'flex', alignItems: "center", justifyContent: "center"}}>
            <Container component="div">
                <Grid
                container
                alignItems="center"
                justifyContent="center"
                direction="column"
                >
                <h1>Logowanie</h1>
                <form onSubmit={handleSubmit(handleSendData)}>
                    <Box m={1}>
                    <CTextField
                        variant="outlined"
                        color="primary"
                        label="Login"
                        {...register("login", {required: "To pole jest wymagane"})}
                        error={Boolean(errors.login?.message)}
                        helperText={errors.login?.message as ReactNode}
                    />
                    </Box>
                    <Box m={1}>
                    <CTextField
                        variant="outlined"
                        color="primary"
                        type="password"
                        label="Hasło"
                        {...register("pwd", {required: "To pole jest wymagane"})}
                        error={Boolean(errors.pwd?.message)}
                        helperText={errors.pwd?.message as ReactNode}
                    />
                    </Box>
                    <CButton type="submit" variant="contained" sx={{width: "calc(100% - 20px)", margin: "0 10px"}}>
                    Zaloguj
                    </CButton>
                </form>
                </Grid>
            </Container>
        </main>
  </>
  );
};

export default Login;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn === true) {
        return ({
            redirect: {
                destination: '/admin',
                permanent: false,
            },
        })
      }
  
      return {
        props: {},
      };
    },
    sessionOptions
);
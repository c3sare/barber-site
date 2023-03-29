import { Grid, Box, Container } from "@mui/material";
import { ReactNode, useState } from "react";
import Head from "next/head";
import style from "../../styles/admin.module.css";

import CTextField from "../../componentsAdminPanel/elements/CTextField";
import { useForm } from "react-hook-form";
import { useRouter } from "next/router";
import { withIronSessionSsr } from "iron-session/next";
import { sessionOptions } from "@/lib/AuthSession/Config";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import LoginIcon from "@mui/icons-material/Login";

const Login = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({});

  const handleSendData = (data: any) => {
    setLoading(true);
    fetch("/api/login", {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (data.isLoggedIn === true) {
          router.push("/admin/");
        } else {
          setMsg(data.msg);
          setTimeout(() => setMsg(""), 3000);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <>
      <Head>
        <title>Panel Administracyjny</title>
      </Head>
      <main
        className={style.main + " " + style.fullWidth}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container component="div">
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
            textAlign="center"
          >
            <h1>Logowanie</h1>
            <form onSubmit={handleSubmit(handleSendData)}>
              <Box m={1}>
                <CTextField
                  disabled={loading}
                  variant="outlined"
                  color="primary"
                  label="Login"
                  autoComplete="username"
                  {...register("login", { required: "To pole jest wymagane" })}
                  error={Boolean(errors.login?.message)}
                  helperText={errors.login?.message as ReactNode}
                />
              </Box>
              <Box m={1}>
                <CTextField
                  disabled={loading}
                  variant="outlined"
                  color="primary"
                  type="password"
                  label="Hasło"
                  autoComplete="current-password"
                  {...register("pwd", { required: "To pole jest wymagane" })}
                  error={Boolean(errors.pwd?.message)}
                  helperText={errors.pwd?.message as ReactNode}
                />
              </Box>
              <CLoadingButton
                loading={loading}
                loadingPosition="start"
                startIcon={<LoginIcon />}
                disabled={loading}
                type="submit"
                variant="contained"
              >
                Zaloguj
              </CLoadingButton>
              <span className="error">{msg}</span>
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
    const session = req.session.user;

    if (session?.isLoggedIn) {
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };
    }

    return {
      props: {},
    };
  },
  sessionOptions
);

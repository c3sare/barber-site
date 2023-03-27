import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Box } from "@mui/material";
import getMailConfig from "@/lib/getMailConfig";
import dbConnect from "@/lib/dbConnect";

interface MailConfig {
  host: string;
  port: number;
  mail: string;
  pwd: string;
}

const AdminPanelPostConfig = ({ permissions, data }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
  } = useForm<MailConfig>();

  const handleSendData = (data: any) => {
    setLoading(true);
    fetch("/api/mailconfig", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error === false) {
          console.log("Prawidłowo zaakutalizowano dane!");
        } else {
          console.log("Wystąpił błąd przy zapisie ustawień!");
        }
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  return (
    <Layout perms={permissions}>
      <h1>Konfiguracja Poczty</h1>
      <form
        onSubmit={handleSubmit(handleSendData)}
        style={{
          width: "100%",
          maxWidth: "550px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <Box pb={1}>
          <Controller
            control={control}
            name="host"
            defaultValue={data.host}
            rules={{
              required: "To pole jest wymagane",
              pattern: {
                value:
                  /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/,
                message: "Nieprawidłowa wartość",
              },
            }}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <CTextField
                variant="outlined"
                label="Host"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors.host)}
                helperText={errors.host?.message as string}
              />
            )}
          />
        </Box>
        <Box pb={1}>
          <Controller
            control={control}
            name="mail"
            defaultValue={data.mail}
            rules={{
              required: "To pole jest wymagane",
              pattern: {
                value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                message: "Nieprawidłowa wartość",
              },
            }}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <CTextField
                variant="outlined"
                label="E-Mail"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors.mail)}
                helperText={errors.mail?.message as string}
              />
            )}
          />
        </Box>
        <Box pb={1}>
          <Controller
            control={control}
            name="pwd"
            defaultValue={data.pwd}
            rules={{
              required: "To pole jest wymagane",
            }}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <CTextField
                variant="outlined"
                label="Hasło"
                type="password"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors.pwd)}
                helperText={errors.pwd?.message as string}
              />
            )}
          />
        </Box>
        <Box pb={1}>
          <Controller
            control={control}
            name="port"
            defaultValue={data.port}
            rules={{
              required: "To pole jest wymagane",
              max: {
                message: "Nieprawidłowa wartość",
                value: 9999,
              },
              min: {
                message: "Nieprawidłowa wartość",
                value: 1,
              },
            }}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <CTextField
                variant="outlined"
                label="Port"
                type="number"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors.port)}
                helperText={errors.port?.message as string}
              />
            )}
          />
        </Box>
        <CLoadingButton
          type="submit"
          loading={loading}
          disabled={loading}
          startIcon={<SaveIcon />}
          loadingPosition="start"
        >
          Zapisz zmiany
        </CLoadingButton>
      </form>
    </Layout>
  );
};

export default AdminPanelPostConfig;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    console.log(req.session);

    if (user?.isLoggedIn !== true || !user?.permissions?.smtpconfig) {
      return {
        notFound: true,
      };
    }
    await dbConnect();
    const data = await getMailConfig();

    return {
      props: {
        data,
        permissions: user?.permissions,
      },
    };
  },
  sessionOptions
);

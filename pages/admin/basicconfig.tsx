import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import Info from "@/models/Info";
import { Box, Grid } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";

const AdminPanelBasicConfig = ({ permissions, data }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const currentYear = new Date().getFullYear();
  const [msg, setMsg] = useState("");
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleSendForm = (data: any) => {
    setLoading(true);
    fetch("/api/info", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data: any) => {
        if (data.error === false) {
          setMsg("Dane zostały zaktualizowane!");
          setTimeout(() => setMsg(""), 5000);
        } else {
          setMsg("Nie można w tej chwili zaktualizować danych!");
          setTimeout(() => setMsg(""), 5000);
        }
      })
      .catch((error: any) => {
        console.log(error);
        setMsg("Wystąpił błąd przy wysyłaniu!");
        setTimeout(() => setMsg(""), 5000);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Layout perms={permissions}>
      <h1>Podstawowa Konfiguracja</h1>
      <Grid
        container
        alignItems="center"
        justifyContent="center"
        direction="column"
      >
        <form
          onSubmit={handleSubmit(handleSendForm)}
          autoComplete="off"
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
              defaultValue={data.companyName}
              name="companyName"
              rules={{
                required: "To pole jest wymagane.",
                pattern: {
                  value: /^[a-zA-Z][a-zA-Z0-9-_.\s]{1,20}$/i,
                  message: "Nieprawidłowo uzupełnione pole",
                },
                maxLength: {
                  value: 20,
                  message: "Max. ilość znaków to 20",
                },
                minLength: {
                  value: 2,
                  message: "Min. ilość znaków to 2",
                },
              }}
              render={({ field: { onChange, onBlur, value, ref, name } }) => (
                <CTextField
                  disabled={loading}
                  name={name}
                  label="Nazwa strony"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  error={Boolean(errors.companyName)}
                  helperText={errors.companyName?.message as string}
                />
              )}
            />
          </Box>
          <Box pb={1}>
            <Controller
              control={control}
              name="slogan"
              defaultValue={data.slogan}
              rules={{
                maxLength: {
                  value: 20,
                  message: "Max. długość to 20 znaków",
                },
                pattern: {
                  value: /^[a-zA-Z][a-zA-Z0-9-_.\s]{1,20}$/i,
                  message: "Pole nieprawidłowo uzupełnione",
                },
              }}
              render={({ field: { onChange, onBlur, value, ref, name } }) => (
                <CTextField
                  disabled={loading}
                  name={name}
                  label="Motto"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  error={Boolean(errors.slogan)}
                  helperText={errors.slogan?.message as string}
                />
              )}
            />
          </Box>
          <Box pb={1}>
            <Controller
              control={control}
              name="yearOfCreate"
              defaultValue={data.yearOfCreate}
              rules={{
                required: "To pole jest wymagane",
                pattern: /^\d{4}$/i,
                min: {
                  value: 1900,
                  message: "Min. wartość pola to 1900",
                },
                max: {
                  value: currentYear,
                  message: `Max. wartość pola to ${currentYear}`,
                },
              }}
              render={({ field: { onChange, onBlur, value, ref, name } }) => (
                <CTextField
                  disabled={loading}
                  name={name}
                  type="number"
                  label="Rok założenia"
                  onChange={(e) => {
                    if (Number(e.target.value) < 1900) {
                      e.target.value = "1900";
                    } else if (Number(e.target.value) > currentYear) {
                      e.target.value = `${currentYear}`;
                    }
                    onChange(e);
                  }}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  error={Boolean(errors.yearOfCreate)}
                  helperText={errors.yearOfCreate?.message as string}
                />
              )}
            />
          </Box>
          <CLoadingButton
            startIcon={<SaveIcon />}
            loadingPosition="start"
            disabled={loading}
            type="submit"
            loading={loading}
          >
            Zapisz zmiany
          </CLoadingButton>
        </form>
        {msg.length > 0 && <h5 style={{ textAlign: "center" }}>{msg}</h5>}
      </Grid>
    </Layout>
  );
};

export default AdminPanelBasicConfig;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if (user?.isLoggedIn !== true || !user?.permissions?.basic) {
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };
    }
    await dbConnect();
    const data = JSON.parse(JSON.stringify(await Info.findOne({})));

    return {
      props: {
        data,
        permissions: user?.permissions,
      },
    };
  },
  sessionOptions
);

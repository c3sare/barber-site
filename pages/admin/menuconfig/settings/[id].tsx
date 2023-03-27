import { Layout } from "@/componentsAdminPanel/Layout";
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import { useState } from "react";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import CCheckbox from "@/componentsAdminPanel/elements/CCheckBox";
import { Box, FormControlLabel, Grid } from "@mui/material";
import CButton from "@/componentsAdminPanel/elements/CButton";
import Link from "next/link";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import Menu from "@/models/Menu";
import { ObjectId } from "mongodb";

const AdminPanelIndex = ({ permissions = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const { data, error, isLoading } = useSWR(
    "/api/menu/settings/" + router.query.id
  );
  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
  } = useForm();

  const handleSendData = (data: any) => {
    setLoading(true);
    fetch("/api/menu/settings/" + router.query.id, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((data) => data.json())
      .then((data) => {
        if (!data.error) {
          router.push("/admin/menuconfig#edit");
        } else {
          console.log("error");
          setLoading(false);
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <Layout perms={permissions}>
      {!isLoading ? (
        !error ? (
          <form onSubmit={handleSubmit(handleSendData)}>
            <h1>Ustawienia - {data.title}</h1>
            <Grid
              container
              alignItems="center"
              direction="column"
              sx={{
                maxWidth: "550px",
                width: "100%",
                margin: "0 auto",
              }}
            >
              <CTextField
                label="Tytuł"
                disabled={loading}
                {...register("title", {
                  value: data.title,
                  pattern: {
                    value:
                      /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                    message: "Pole wypełniono nieprawidłowo!",
                  },
                  required: "To pole jest wymagane!",
                  maxLength: {
                    value: 25,
                    message: "Maksymalna długość to 25 znaków!",
                  },
                })}
                error={Boolean(errors.title)}
                helperText={errors.title?.message as string}
              />
              {data.slug !== "" && !data.default && (
                <CTextField
                  label="Adres"
                  disabled={loading}
                  {...register("slug", {
                    value: data.slug,
                    pattern: {
                      value: /^[a-z](-?[a-z])*$/,
                      message: "Pole wypełniono nieprawidłowo!",
                    },
                    required: "To pole jest wymagane!",
                    maxLength: {
                      value: 20,
                      message: "Maksymalna długość to 20 znaków!",
                    },
                  })}
                  error={Boolean(errors.slug)}
                  helperText={errors.slug?.message as string}
                />
              )}
              {data.slug !== "" && (
                <Controller
                  control={control}
                  name="on"
                  defaultValue={data.on}
                  render={({ field: { onChange, onBlur, value, ref } }) => (
                    <FormControlLabel
                      label="Strona jest widoczna"
                      disabled={loading}
                      control={
                        <CCheckbox
                          color="default"
                          onChange={onChange}
                          name="on"
                          onBlur={onBlur}
                          checked={Boolean(value)}
                          inputRef={ref}
                        />
                      }
                    />
                  )}
                />
              )}
              {data.default &&
                !["reservations", "news"].includes(data.slug) && (
                  <Controller
                    control={control}
                    name="custom"
                    defaultValue={data.custom}
                    render={({
                      field: { onChange, onBlur, value, ref, name },
                    }) => (
                      <FormControlLabel
                        disabled={loading}
                        label="Strona niestandardowa"
                        control={
                          <CCheckbox
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
                )}
              <Box>
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
                  type="submit"
                >
                  Zapisz zmiany
                </CLoadingButton>
              </Box>
            </Grid>
          </form>
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

    const node = JSON.parse(
      JSON.stringify(await Menu.find({ _id: new ObjectId(query.id as string) }))
    );

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

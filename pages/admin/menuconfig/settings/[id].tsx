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
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";

const AdminPanelIndex = ({ permissions = {}, node = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
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
      <form onSubmit={handleSubmit(handleSendData)}>
        <h1>Ustawienia - {node.title}</h1>
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
              value: node.title,
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
          {node.slug !== "" && !node.default && (
            <CTextField
              label="Adres"
              disabled={loading}
              {...register("slug", {
                value: node.slug,
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
          {node.slug !== "" && (
            <Controller
              control={control}
              name="on"
              defaultValue={node.on}
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
          {node.default && !["reservations", "news"].includes(node.slug) && (
            <Controller
              control={control}
              name="custom"
              defaultValue={node.custom}
              render={({ field: { onChange, onBlur, value, ref, name } }) => (
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
    </Layout>
  );
};

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, query }) {
    const session = req.session?.user;

    if (
      !session?.isLoggedIn ||
      !session?.id ||
      !Types.ObjectId.isValid(session?.id) ||
      !Types.ObjectId.isValid(query.id as string)
    ) {
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };
    }
    await dbConnect();
    const user = await User.findOne({ _id: new Types.ObjectId(session.id) });
    const node = JSON.parse(
      JSON.stringify(
        await Menu.findOne({ _id: new Types.ObjectId(query.id as string) })
      )
    );

    if (!user || !user?.permissions?.menu || !node)
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };

    return {
      props: {
        node,
        permissions: user.permissions,
      },
    };
  },
  sessionOptions
);

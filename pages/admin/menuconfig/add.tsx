import { Layout } from "@/componentsAdminPanel/Layout";
import CButton from "@/componentsAdminPanel/elements/CButton";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { Box, Grid } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { Types } from "mongoose";

const AdminPanelIndex = ({ permissions = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const handleSendData = (data: any) => {
    setLoading(true);
    fetch("/api/menu", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          router.push("/admin/menuconfig#edit");
        } else {
          console.log(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <Layout perms={permissions}>
      <form onSubmit={handleSubmit(handleSendData)}>
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
          <CTextField
            label="Adres"
            disabled={loading}
            {...register("slug", {
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
          <Box>
            <CButton
              disabled={loading}
              LinkComponent={Link}
              href="/admin/menuconfig#edit"
            >
              Wróć
            </CButton>
            <CLoadingButton
              loadingPosition="start"
              loading={loading}
              disabled={loading}
              startIcon={<SaveIcon />}
              type="submit"
            >
              Dodaj
            </CLoadingButton>
          </Box>
        </Grid>
      </form>
    </Layout>
  );
};

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const session = req.session?.user;

    if (
      !session?.isLoggedIn ||
      !session?.id ||
      !Types.ObjectId.isValid(session?.id)
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

    if (!user || !user?.permissions?.menu)
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };

    return {
      props: {
        permissions: user.permissions,
      },
    };
  },
  sessionOptions
);

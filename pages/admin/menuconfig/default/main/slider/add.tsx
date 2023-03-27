import { Layout } from "@/componentsAdminPanel/Layout";
import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/router";
import { Controller, UseFormRegisterReturn, useForm } from "react-hook-form";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Box, IconButton, Typography, styled } from "@mui/material";
import CTextArea from "@/componentsAdminPanel/elements/CTextArea";
import { blueGrey } from "@mui/material/colors";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import React from "react";
import Menu from "@/models/Menu";

interface Slide {
  title: string;
  desc: string;
  image: Blob[];
}

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

// eslint-disable-next-line react/display-name
const Input = React.forwardRef(
  ({ onChange, onBlur, name }: UseFormRegisterReturn, ref: any) => (
    <InputStyled
      accept="image/*"
      id={name}
      type="file"
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        if (
          e.target.files!.length > 0 &&
          e.target.files?.[0]?.type?.indexOf("image")! >= 0
        )
          onChange(e);
      }}
      onBlur={onBlur}
      name={name}
      ref={ref}
    />
  )
);

const SliderAddPage = ({ permissions = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
  } = useForm<Slide>();

  const image = watch("image");

  const handleSendData = (data: Slide) => {
    setLoading(true);
    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("desc", data.desc);
    fd.append("image", data.image[0]);
    fetch("/api/slides", {
      method: "PUT",
      body: fd,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          router.push("/admin/menuconfig/default/main#slider");
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
      <h1>Tworzenie Slajdu</h1>
      <form
        onSubmit={handleSubmit(handleSendData)}
        style={{ textAlign: "center" }}
      >
        <div>
          <img
            style={{
              maxHeight: "300px",
              maxWidth: "300px",
              height: "auto",
              width: "auto",
            }}
            src={image ? URL.createObjectURL(image[0]!) : "/images/vercel.svg"}
            alt="logo"
          />
        </div>
        <label htmlFor={`image`}>
          <Input
            disabled={loading}
            {...register("image", {
              required: "Wymagane!",
            })}
          />
          <IconButton
            color="primary"
            disabled={loading}
            aria-label="upload picture"
            component="span"
            sx={{ color: blueGrey[700] }}
          >
            <CameraAltIcon />
          </IconButton>
        </label>
        <Controller
          control={control}
          name="title"
          defaultValue=""
          rules={{
            required: "To pole jest wymagane.",
            pattern: {
              value: /^(.|\s)*[a-zA-Z]+(.|\s)*$/,
              message: "Nieprawidłowo uzupełnione pole",
            },
            maxLength: {
              value: 80,
              message: "Max. ilość znaków to 80",
            },
          }}
          render={({ field: { onChange, onBlur, value, ref, name } }) => (
            <CTextField
              name={name}
              disabled={loading}
              label="Tytuł"
              sx={{ width: "100%" }}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              inputRef={ref}
              error={Boolean(errors.title)}
              helperText={errors.title?.message as string}
            />
          )}
        />
        <Box
          justifyContent="center"
          sx={{
            position: "relative",
            margin: "8px",
            width: "100%",
          }}
        >
          <Typography
            component="label"
            htmlFor="desc"
            sx={{
              position: "absolute",
              top: "-9px",
              left: "10px",
              fontSize: "12px",
              padding: "0 5px",
              color: loading
                ? "rgba(255, 255, 255, 0.25)"
                : errors.desc
                ? "red"
                : "#cfd8dc",
              backgroundColor: "rgb(36, 36, 36)",
            }}
          >
            Opis
          </Typography>
          <CTextArea
            id="desc"
            disabled={loading}
            style={{
              height: "110px",
              ...{
                ...(loading
                  ? {
                      borderColor: "rgba(0, 0, 0, 0.38)",
                      color: "rgba(255, 255, 255, 0.25)",
                    }
                  : errors.desc
                  ? {
                      borderColor: "red",
                      color: "red",
                    }
                  : {}),
              },
            }}
            {...register("desc", {
              required: "To pole jest wymagane",
              pattern: {
                value: /^(.|\s)*[a-zA-Z]+(.|\s)*$/,
                message: "Pole nieprawidłowo wypełnione",
              },
              maxLength: {
                value: 800,
                message: "Max. ilość znaków to 800",
              },
            })}
          />
          {errors.desc && (
            <span
              style={{
                color: "red",
                width: "100%",
                display: "block",
                textAlign: "left",
                fontSize: "12px",
                letterSpacing: "0.75px",
                paddingLeft: "20px",
                opacity: "0.7",
              }}
            >
              {errors.desc?.message as string}
            </span>
          )}
        </Box>
        <CButton
          disabled={loading}
          LinkComponent={Link}
          href="/admin/menuconfig/default/main#slider"
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
      </form>
    </Layout>
  );
};

export default SliderAddPage;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    const menu = await Menu.findOne({ slug: "" });

    if (
      user?.isLoggedIn !== true ||
      !user?.permissions?.menu ||
      !menu ||
      menu?.custom
    ) {
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

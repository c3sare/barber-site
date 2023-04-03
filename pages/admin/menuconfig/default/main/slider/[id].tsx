/* eslint-disable @next/next/no-img-element */
import { Layout } from "@/componentsAdminPanel/Layout";
import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { useRouter } from "next/router";
import { Controller, useForm } from "react-hook-form";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Box, IconButton, Typography, styled } from "@mui/material";
import CTextArea from "@/componentsAdminPanel/elements/CTextArea";
import { blueGrey } from "@mui/material/colors";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import React from "react";
import Menu from "@/models/Menu";
import Slide from "@/models/Slide";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";
import User from "@/models/User";
import ImageSelect from "@/componentsAdminPanel/ImageSelect";

interface Slide {
  title: string;
  desc: string;
  image: string | Blob[];
}

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

// eslint-disable-next-line react/display-name
const Input = React.forwardRef(({ onBlur, name }: any, ref: any) => (
  <InputStyled
    id={name}
    type="text"
    onChange={(_e: any) => null as any}
    onBlur={onBlur}
    name={name}
    ref={ref}
  />
));

const SliderEditPage = ({ permissions = {}, data }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    watch,
    setValue,
  } = useForm<Slide>({
    defaultValues: {
      title: data.title,
      desc: data.desc,
      image: data.image,
    },
  });

  const image = watch("image");

  const { onBlur, name, ref } = register("image");

  const handleSendData = (data: Slide) => {
    setLoading(true);
    fetch(`/api/slides/${router.query.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
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
      <h1>Edycja Slajdu - {data.title}</h1>
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
            src={`https://barberianextjs.s3.eu-central-1.amazonaws.com/${image}`}
            alt="logo"
          />
        </div>
        <Input onBlur={onBlur} ref={ref} name={name} disabled={loading} />
        <IconButton
          color="primary"
          disabled={loading}
          aria-label="upload picture"
          component="span"
          onClick={() => setOpen(true)}
          sx={{ color: blueGrey[700] }}
        >
          <CameraAltIcon />
        </IconButton>
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
      {open && (
        <ImageSelect
          setOpen={setOpen}
          setSelectedImage={(name: string) => setValue("image", name)}
        />
      )}
    </Layout>
  );
};

export default SliderEditPage;

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
    const node = await Menu.findOne({ slug: "", custom: false });
    const data = JSON.parse(
      JSON.stringify(
        await Slide.findOne({ _id: new Types.ObjectId(query.id as string) })
      )
    );

    if (!user || !user?.permissions?.menu || !node || !data)
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };

    return {
      props: {
        data,
        permissions: user.permissions,
      },
    };
  },
  sessionOptions
);

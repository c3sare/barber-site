/* eslint-disable @next/next/no-img-element */
import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import NewsData from "@/lib/types/NewsData";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm, UseFormRegisterReturn } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";
import { Box, IconButton, styled, Typography } from "@mui/material";
import CTextArea from "@/componentsAdminPanel/elements/CTextArea";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import React from "react";
import { blueGrey } from "@mui/material/colors";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import PageEditor from "@/componentsAdminPanel/PageEditor";
import { Value } from "@react-page/editor";
import { useRouter } from "next/router";
import { Types } from "mongoose";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import ImageSelect from "@/componentsAdminPanel/ImageSelect";

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

// eslint-disable-next-line react/display-name
const Input = React.forwardRef(
  ({ onBlur, name }: UseFormRegisterReturn, ref: any) => (
    <InputStyled
      id={name}
      onChange={(_e: any) => null as any}
      onBlur={onBlur}
      name={name}
      ref={ref}
    />
  )
);

function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month =
    date.getMonth() + 1 > 9 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
  const day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();

  return `${year}-${month}-${day}`;
}

const AddNews = ({ permissions = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [content, setContent] = useState<Value | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    watch,
    setValue,
  } = useForm<NewsData>({
    defaultValues: {
      title: "",
      desc: "",
      img: "",
    },
  });

  const handleSendData = (data: NewsData) => {
    setLoading(true);
    fetch("/api/news", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data, content: content }),
    })
      .then((data) => data.json())
      .then((data) => {
        if (!data.error) {
          router.push("/admin/news");
        } else {
          console.log("error");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const image = watch("img");

  return (
    <Layout perms={permissions}>
      <h1>Tworzenie artykułu</h1>
      <form
        onSubmit={handleSubmit(handleSendData)}
        style={{ textAlign: "center", margin: "0 auto", maxWidth: "550px" }}
      >
        <div>
          <img
            style={{
              maxHeight: "300px",
              maxWidth: "300px",
              height: "auto",
              width: "auto",
            }}
            src={
              image
                ? "https://barberianextjs.s3.eu-central-1.amazonaws.com/" +
                  image
                : "/images/vercel.svg"
            }
            alt="logo"
          />
        </div>
        <Input
          disabled={loading}
          {...register("img", {
            required: "Wymagane!",
          })}
        />
        <IconButton
          color="primary"
          disabled={loading}
          aria-label="upload picture"
          component="span"
          sx={{ color: blueGrey[700] }}
          onClick={() => setOpen(true)}
        >
          <CameraAltIcon />
        </IconButton>
        <Controller
          control={control}
          name="date"
          defaultValue={getTodayDate()}
          rules={{
            required: "To pole jest wymagane.",
            pattern: {
              value: /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/,
              message: "Nieprawidłowo uzupełnione pole",
            },
          }}
          render={({ field: { onChange, onBlur, value, ref, name } }) => (
            <CTextField
              disabled={loading}
              sx={{ width: "100%", margin: "0" }}
              variant="outlined"
              label="Data utworzenia"
              type="date"
              onChange={onChange}
              onBlur={onBlur}
              name={name}
              value={value}
              inputRef={ref}
              error={Boolean(errors.date)}
              helperText={errors.date?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="title"
          rules={{
            required: "To pole jest wymagane.",
            pattern: {
              value:
                /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
              message: "Nieprawidłowo uzupełnione pole",
            },
            maxLength: {
              value: 80,
              message: "Max. ilość znaków to 80",
            },
          }}
          defaultValue=""
          render={({ field: { onChange, onBlur, value, ref, name } }) => (
            <CTextField
              disabled={loading}
              sx={{ width: "100%", margin: "16px 0" }}
              variant="outlined"
              label="Tytuł"
              onChange={onChange}
              onBlur={onBlur}
              name={name}
              value={value}
              inputRef={ref}
              error={Boolean(errors.title)}
              helperText={errors.title?.message}
            />
          )}
        />
        <Box sx={{ position: "relative" }}>
          <Typography
            component="label"
            htmlFor="desc"
            sx={{
              position: "absolute",
              top: "-9px",
              left: "11px",
              fontSize: "12px",
              padding: "0 5px",
              color: "#cfd8dc",
              backgroundColor: "rgb(36, 36, 36)",
            }}
          >
            Opis
          </Typography>
          <CTextArea
            id="desc"
            disabled={loading}
            style={{ height: "110px" }}
            {...register("desc", {
              required: "To pole jest wymagane",
              pattern: {
                value: /^(.|\s)*[a-zA-Z]+(.|\s)*$/,
                message: "Pole nieprawidłowo wypełnione",
              },
              maxLength: {
                value: 400,
                message: "Max. ilość znaków to 400",
              },
            })}
          />
          {errors.desc && (
            <span style={{ color: "red" }}>{errors.desc.message}</span>
          )}
        </Box>
        <h2>Treść</h2>
        <PageEditor value={content} setValue={setContent} loading={loading} />
        <CButton disabled={loading} LinkComponent={Link} href="/admin/news">
          Wróć
        </CButton>
        <CLoadingButton
          loading={loading}
          disabled={loading}
          startIcon={<SaveIcon />}
          loadingPosition="start"
          type="submit"
        >
          Zapisz
        </CLoadingButton>
      </form>
      {open && (
        <ImageSelect
          setOpen={setOpen}
          setSelectedImage={(name: string) => setValue("img", name)}
        />
      )}
    </Layout>
  );
};

export default AddNews;

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

    if (!user || !user?.permissions?.news)
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

/* eslint-disable @next/next/no-img-element */
import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import NewsData from "@/lib/types/NewsData";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import path from "path";
import getData from "@/utils/getData";
import fs from "fs/promises";

const InputStyled = styled("input")({
    display: "none",
    color: "",
  });
  
  // eslint-disable-next-line react/display-name
  const Input = React.forwardRef(({ onChange, onBlur, name }:any, ref:any) => (
    <InputStyled
      accept="image/*"
      id={name}
      type="file"
      onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files!.length > 0 && e.target.files?.[0]?.type?.indexOf("image")! >= 0) onChange(e);
      }}
      onBlur={onBlur}
      name={name}
      ref={ref}
    />
));

const AddNews = ({permissions={}, data}: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [content, setContent] =  useState<Value | null>(data.content);
    const {register, control, formState: {errors}, handleSubmit, watch, setValue} = useForm<NewsData>({
        defaultValues: {
            title: data.title,
            desc: data.desc,
            date: data.date,
            img: data.img
        }
    });

    const handleSendData = (data:NewsData) => {
        setLoading(true);
        fetch("/api/news/"+router.query.id, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...data, content})
        })
        .then(data => data.json())
        .then(data => {
            if(!data.error) {
                router.push("/admin/news")
            } else {
                console.log("error");
                setLoading(false);
            }
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        });
    }

    const onChangeImage = async (e:React.ChangeEvent<HTMLInputElement>) => {
        if(e.target?.files?.length === 1) {
            setLoading(true);
            const fd = new FormData();
            fd.append("img", e.target.files[0]);
            const data = await fetch("/api/news/image/"+router.query.id, {
                method: "POST",
                body: fd
            }).then(res => res.json())
            .then(data => {
                setLoading(false);
                return data;
            })
            if(!data.error) {
                setValue("img", data.img)
            } else {
                console.log("error");
            }

        }
    }

    const image = watch("img");

    const {onBlur, name, ref } = register("img");

    return (
        <Layout perms={permissions}>
            <h1>Edycja artykułu</h1>
            <form onSubmit={handleSubmit(handleSendData)} style={{textAlign: "center", margin: "0 auto", maxWidth: "550px"}}>
                <div>
                    <img
                        style={{ maxHeight: "300px", maxWidth: "300px", height: "auto", width: "auto" }}
                        src={`/images/articles/${image}`}
                        alt="logo"
                    />
                </div>
                <label htmlFor={`img`}>
                    <Input
                      disabled={loading}
                      onBlur={onBlur}
                      ref={ref}
                      name={name}
                      onChange={onChangeImage}
                    />
                    <IconButton
                      color="primary"
                      disabled={loading}
                      aria-label="upload picture"
                      component="span"
                      sx={{color: blueGrey[700]}}
                    >
                      <CameraAltIcon/>
                    </IconButton>
                </label>
                <Controller
                    control={control}
                    name="date"
                    rules={{
                        required: "To pole jest wymagane.",
                        pattern: {
                            value: /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/,
                            message: "Nieprawidłowo uzupełnione pole",
                        }
                    }}
                    render={({ field: { onChange, onBlur, value, ref, name } }) => (
                        <CTextField
                            sx={{width: "100%", margin: "0"}}
                            variant="outlined"
                            label="Data utworzenia"
                            type="date"
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
                <Controller
                    control={control}
                    name="title"
                    rules={{
                        required: "To pole jest wymagane.",
                        pattern: {
                            value: /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                            message: "Nieprawidłowo uzupełnione pole",
                        },
                        maxLength: {
                            value: 80,
                            message: "Max. ilość znaków to 80",
                        },
                    }}
                    render={({ field: { onChange, onBlur, value, ref, name } }) => (
                        <CTextField
                            sx={{width: "100%", margin: "16px 0"}}
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
                <Box sx={{position: "relative"}}>
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
                        backgroundColor: "rgb(36, 36, 36)"
                    }}
                    >
                    Opis
                    </Typography>
                    <CTextArea
                    id="desc"
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
                <PageEditor value={content} setValue={setContent} loading={loading}/>
                <CButton disabled={loading} LinkComponent={Link} href="/admin/news">Wróć</CButton>
                <CLoadingButton loading={loading} disabled={loading} startIcon={<SaveIcon/>} loadingPosition="start" type="submit">
                    Zapisz
                </CLoadingButton>
            </form>
        </Layout>
    )
}

export default AddNews;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req, query }) {
      const user = req.session.user;

      const data = (await getData("news")).find((item:any) => item._id === query.id);

  
      if (user?.isLoggedIn !== true || !user?.permissions?.news || data === undefined) {
        return {
          notFound: true,
        };
      }
      const newsDirectory = path.join(process.cwd(), 'news');
      const content = data === null ? "" : await fs.readFile(`${newsDirectory}/${data._id}.json`, "utf-8");
  
      return {
        props: {
          data: {...data, content: JSON.parse(content)},
          permissions: user?.permissions,
        },
      };
    },
    sessionOptions
);
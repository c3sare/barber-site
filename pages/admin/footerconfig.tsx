/* eslint-disable @next/next/no-img-element */
import CButton from "@/componentsAdminPanel/elements/CButton";
import CCheckbox from "@/componentsAdminPanel/elements/CCheckBox";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import CTextArea from "@/componentsAdminPanel/elements/CTextArea";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import FooterData from "@/lib/types/FooterData";
import { getDataOne } from "@/utils/getData";
import { Box, createTheme, FormControlLabel, Grid, IconButton, styled, ThemeProvider, Typography } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { withIronSessionSsr } from "iron-session/next";
import React, { useState } from "react";
import { Controller, useFieldArray, useForm, UseFormRegisterReturn } from "react-hook-form";
import { FaCamera, FaMinus, FaPlus, FaSave } from "react-icons/fa";

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

// eslint-disable-next-line react/display-name
const Input = React.forwardRef(({ onChange, onBlur, name }:UseFormRegisterReturn, ref:any) => (
  <InputStyled
    accept="image/*"
    id="contained-button-file"
    type="file"
    onChange={(e:React.ChangeEvent<HTMLInputElement>) => {
      if(e.target.files!.length > 0 && e.target.files?.[0]?.type?.indexOf("image")! >= 0) onChange(e);
    }}
    onBlur={onBlur}
    name={name}
    ref={ref}
  />
));

const theme = createTheme({
  palette: {
    primary: {
      main: blueGrey[700],
      contrastText: "white",
    },
  },
});

const AdminPanelFooterConfig = ({permissions, data}: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const {
    register,
    formState: { errors },
    control,
    handleSubmit,
    clearErrors,
    watch,
    setValue
  } = useForm<FooterData>({defaultValues: data});

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "linkBoxes",
  });
  const [msg, setMsg] = useState<string>("");

  const createAlert = (text:string) => {
    setMsg(text);
    setTimeout(() => {
      setMsg("");
    }, 5000);
  };
  const logo = watch("logo");
  const btnMore = watch("btnMore");

  const submitForm = (data:any) => {
    setLoading(true);

    fetch("/api/footer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        linkBoxes: data.linkBoxes,
        desc: data.desc,
        btnMore: data.btnMore,
        btnLink: data.btnLink,
        btnTitle: data.btnTitle
      })
    })
    .then(data => data.json())
    .then((data) => {
      if(!data.error) {
        createAlert("Dane zostały poprawnie wysłane!");
      } else createAlert("Wystąpił problem przy aktualizacji danych!");
    })
    .catch(() => {
      createAlert("Wystąpił problem przy wysyłaniu danych!");
    })
    .finally(() => {
      setLoading(false);
    })
  };

  const handleAddLinkToBox = (boxIndex:number) => {
    if (fields[boxIndex].links.length < 5) {
      clearErrors();
      update(boxIndex, {
        name: fields[boxIndex].name,
        links: [
          ...fields[boxIndex].links,
          {
            id:
              fields[boxIndex].links.length > 0
                ? fields[boxIndex].links[fields[boxIndex].links.length - 1].id +
                  1
                : 1,
            name: "",
            url: "",
          },
        ],
      });
    }
  };

  const handleAddBox = () => {
    if (fields.length < 4) {
      clearErrors();
      append({ name: "", links: [{ id: 1, name: "", url: "" }] });
    }
  };

  const handleRemoveBox = (boxIndex:number) => {
    clearErrors();
    remove(boxIndex);
  };

  const handleRemoveLinkFromBox = (boxIndex:number, linkId:number) => {
    clearErrors();
    update(boxIndex, {
      name: fields[boxIndex].name,
      links: [...fields[boxIndex].links.filter((link) => link.id !== linkId)],
    });
  };

  const {onBlur, ref, name} = register("logo");

  const onChange = async (e:any) => {
    if(e.target?.files?.length === 1) {
      setLoading(true);
      const fd = new FormData();
      fd.append("logo", e.target.files[0]);
      const data = await fetch("/api/footer/logo", {
        method: "POST",
        body: fd
      }).then(res => res.json())
      .then(data => {
          return data;
      })
      if(!data.error) {
          setValue("logo", data.img)
      } else {
          console.log("error");
      }
      setLoading(false);
    }
  }

    return (
        <Layout perms={permissions}>
      <h1>Konfiguracja Stopki</h1>
      <form onSubmit={handleSubmit((data) => submitForm(data))}>
        <Grid
          container
          alignItems="center"
          direction="column"
          sx={{ maxWidth: "550px", margin: "0 auto", "& > *": {margin: "15px 0"} }}
        >
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            direction="column"
          >
            <Grid item>
              <Box pb={1}>
                <Typography component="h2">Logo</Typography>
              </Box>
            </Grid>
            <Grid
              container
              direction="row"
              justifyContent="center"
              alignItems="center"
            >
              <img
                style={{ maxHeight: "72px" }}
                src={`/images/${logo}`}
                alt="logo"
              />
              <ThemeProvider theme={theme}>
                <label htmlFor="contained-button-file">
                  <Input
                    onBlur={onBlur}
                    ref={ref}
                    name={name}
                    onChange={onChange}
                    disabled={loading}
                  />
                  <IconButton
                    disabled={loading}
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                  >
                    <FaCamera />
                  </IconButton>
                </label>
              </ThemeProvider>
            </Grid>
          </Grid>
          <Grid container justifyContent="center" sx={{position: "relative"}}>
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
              disabled={loading}
              id="desc"
              style={{ height: "110px" }}
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
              <span style={{ color: "red" }}>{errors.desc.message}</span>
            )}
          </Grid>
          <Grid container alignItems="center" direction="column">
            <Grid item xs={12} lg={6} md={8}>
              <Box>
                <Typography component="h3">Ustawienia Przycisku</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} lg={6} md={8}>
              <Controller
                control={control}
                name="btnMore"
                render={({ field: { onChange, onBlur, value, ref, name } }) => (
                  <FormControlLabel
                    disabled={loading}
                    label="Pokazuj przycisk 'Więcej'"
                    control={
                      <CCheckbox
                        disabled={loading}
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
            </Grid>
            {btnMore && (
              <Grid container justifyContent="space-around">
                <Grid container justifyContent="space-around">
                  <Grid item xs={5}>
                    <Box pb={2}>
                      <Controller
                        control={control}
                        name="btnTitle"
                        rules={{
                          required: "To pole jest wymagane.",
                          pattern: {
                            value:
                              /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                            message: "Nieprawidłowo uzupełnione pole",
                          },
                          maxLength: {
                            value: 25,
                            message: "Max. ilość znaków to 25",
                          },
                        }}
                        render={({ field: { onChange, onBlur, value, ref, name } }) => (
                          <CTextField
                            disabled={loading}
                            variant="outlined"
                            label="Nazwa przycisku"
                            onChange={onChange}
                            onBlur={onBlur}
                            name={name}
                            value={value}
                            inputRef={ref}
                            error={Boolean(errors.btnTitle)}
                            helperText={errors.btnTitle?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={5}>
                    <Box pb={2}>
                      <Controller
                        control={control}
                        defaultValue=""
                        name="btnLink"
                        rules={{
                          required: "To pole jest wymagane.",
                          pattern: {
                            value: /(www|http:|https:|^\/)+[^\s]+[\w]/,
                            message: "Nieprawidłowo uzupełnione pole",
                          },
                          maxLength: {
                            value: 256,
                            message: "Max. ilość znaków to 256",
                          },
                        }}
                        render={({ field: { onChange, onBlur, value, ref, name } }) => (
                          <CTextField
                            disabled={loading}
                            variant="outlined"
                            label="Link przycisku"
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            name={name}
                            inputRef={ref}
                            error={Boolean(errors.btnLink)}
                            helperText={errors.btnLink?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            direction="column"
          >
            <Grid item xs={12} lg={6} md={8}>
              <Box pb={1}>
                <Typography component="h2">Kontenery nawigacyjne</Typography>
              </Box>
            </Grid>
            {fields.map((box, boxIndex) => (
              <React.Fragment key={box.id}>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item xs={1}></Grid>
                  <Grid item xs={5}>
                    <Box pr={3} pl={1} pb={1}>
                      <CButton
                        disabled={loading}
                        type="button"
                        fullWidth
                        onClick={() => handleRemoveBox(boxIndex)}
                        variant="contained"
                      >
                        Usuń kontener
                      </CButton>
                    </Box>
                  </Grid>

                  <Grid item xs={5}>
                    <Box pb={2}>
                      <Controller
                        control={control}
                        name={`linkBoxes.${boxIndex}.name`}
                        rules={{
                          required: "To pole jest wymagane.",
                          pattern: {
                            value:
                              /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                            message: "Nieprawidłowo uzupełnione pole",
                          },
                          maxLength: {
                            value: 30,
                            message: "Max. ilość znaków to 30",
                          },
                        }}
                        render={({
                          field: { onChange, onBlur, value, ref, name },
                        }) => (
                          <CTextField
                            disabled={loading}
                            variant="outlined"
                            name={name}
                            label="Nazwa nawigacji"
                            onChange={onChange}
                            onBlur={onBlur}
                            value={value}
                            inputRef={ref}
                            error={Boolean(errors.linkBoxes?.[boxIndex]?.name)}
                            helperText={errors.linkBoxes?.[boxIndex]?.name?.message}
                          />
                        )}
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={1}></Grid>
                </Grid>
                {box.links.map((link, linkIndex) => (
                  <Grid
                    key={link.id}
                    container
                    direction="column"
                    alignItems="center"
                  >
                    <Grid container direction="column" alignItems="center">
                      <Grid
                        container
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Grid item xs={1}>
                          <Box pb={2}>
                            <div>{linkIndex + 1}.</div>
                          </Box>
                        </Grid>
                        <Grid item xs={5}>
                          <Box pb={2}>
                            <Controller
                              control={control}
                              name={`linkBoxes.${boxIndex}.links.${linkIndex}.name`}
                              rules={{
                                required: "To pole jest wymagane.",
                                pattern: {
                                  value:
                                    /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/u,
                                  message: "Nieprawidłowo uzupełnione pole",
                                },
                                maxLength: {
                                  value: 30,
                                  message: "Max. ilość znaków to 30",
                                },
                              }}
                              render={({
                                field: { onChange, onBlur, value, ref, name },
                              }) => (
                                <CTextField
                                  disabled={loading}
                                  variant="outlined"
                                  label="Nazwa odnośnika"
                                  onChange={onChange}
                                  onBlur={onBlur}
                                  name={name}
                                  value={value}
                                  inputRef={ref}
                                  error={Boolean(
                                    errors.linkBoxes?.[boxIndex]?.links?.[linkIndex]
                                      ?.name
                                  )}
                                  helperText={
                                    errors.linkBoxes?.[boxIndex]?.links?.[linkIndex]
                                      ?.name?.message
                                  }
                                />
                              )}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={5}>
                          <Box pb={2}>
                            <Controller
                              control={control}
                              name={`linkBoxes.${boxIndex}.links.${linkIndex}.url`}
                              rules={{
                                required: "To pole jest wymagane.",
                                pattern: {
                                  value: /(www|http:|https:|^\/)+[^\s]+[\w]/,
                                  message: "Nieprawidłowo uzupełnione pole",
                                },
                                maxLength: {
                                  value: 256,
                                  message: "Max. ilość znaków to 256",
                                },
                              }}
                              render={({
                                field: { onChange, onBlur, value, ref, name },
                              }) => (
                                <CTextField
                                  disabled={loading}
                                  variant="outlined"
                                  label="Adres odnośnika"
                                  onChange={onChange}
                                  name={name}
                                  onBlur={onBlur}
                                  value={value}
                                  inputRef={ref}
                                  error={Boolean(
                                    errors.linkBoxes?.[boxIndex]?.links?.[linkIndex]
                                      ?.url
                                  )}
                                  helperText={
                                    errors.linkBoxes?.[boxIndex]?.links?.[linkIndex]
                                      ?.url?.message
                                  }
                                />
                              )}
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={1}>
                          <Box pb={2}>
                            {fields[boxIndex].links.length > 1 && (
                              <CButton
                                disabled={loading}
                                type="button"
                                onClick={() =>
                                  handleRemoveLinkFromBox(boxIndex, link.id)
                                }
                                variant="contained"
                              >
                                <FaMinus />
                              </CButton>
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                      {
                        linkIndex === fields[boxIndex].links.length - 1 &&
                          box.links.length < 5 && (
                            <CButton
                              disabled={loading}
                              type="button"
                              onClick={() => handleAddLinkToBox(boxIndex)}
                              variant="contained"
                            >
                              <FaPlus />
                            </CButton>
                          )
                      }
                    </Grid>
                  </Grid>
                ))}
                <hr style={{ width: "100%", margin: "16px 0" }} />
              </React.Fragment>
            ))}
            {fields.length < 4 && (
              <Grid item>
                <Box>
                  <CButton
                    disabled={loading}
                    onClick={handleAddBox}
                    startIcon={<FaPlus />}
                    type="button"
                    variant="contained"
                  >
                    Dodaj {fields.length ? "następny " : ""}kontener
                  </CButton>
                </Box>
              </Grid>
            )}
          </Grid>
          <Grid item xs={12} lg={6} md={8}>
            <Box>
              <CLoadingButton
                loading={loading}
                loadingPosition="start"
                disabled={loading}
                startIcon={<FaSave />}
                type="submit"
              >
                Zapisz zmiany
              </CLoadingButton>
            </Box>
          </Grid>
        </Grid>
        {msg.length > 0 ? <span style={{display: "block", width: "100%", textAlign: "center"}}>{msg}</span> : null}
      </form>
        </Layout>
    )
}

export default AdminPanelFooterConfig;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;

    if (user?.isLoggedIn !== true || !user?.permissions?.footer) {
      return {
        redirect: {
          destination: '/admin',
          permanent: false,
        },
      };
    }

    const data = await getDataOne("footer");

    return {
      props: {
        data,
        permissions: req.session.user?.permissions,
      },
    };
  },
  sessionOptions
);
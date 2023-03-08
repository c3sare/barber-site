/* eslint-disable @next/next/no-img-element */
import DescMainData from "@/lib/types/DescMainData";
import { Box, IconButton, Typography, styled } from "@mui/material";
import { useEffect, useState } from "react";
import { Controller, useForm, useFieldArray, UseFormRegisterReturn } from "react-hook-form"
import CTextArea from "../elements/CTextArea";
import CTextField from "../elements/CTextField";
import AddIcon from '@mui/icons-material/Add';
import CLoadingButton from "../elements/CLoadingButton";
import SaveIcon from '@mui/icons-material/Save';
import React from "react";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { blueGrey } from "@mui/material/colors";
import DeleteIcon from '@mui/icons-material/Delete';

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

// eslint-disable-next-line react/display-name
const Input = React.forwardRef(({ onChange, onBlur, name }:UseFormRegisterReturn, ref:any) => (
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

export default function DescMain() {
    const [loading, setLoading] = useState<boolean>(true);
    const {control, formState: {errors}, register, handleSubmit, watch, setValue} = useForm<DescMainData>();
    const {fields, append, remove} = useFieldArray({
        name: "pros",
        control,
    });

    useEffect(() => {
      fetch("/api/descmain")
      .then(data => data.json())
      .then(data => {
        setValue("title", data.title);
        setValue("description", data.description);
        setValue("pros", data.pros);
      })
      .catch(err => {
        console.log(err);
      })
      .finally(() => setLoading(false));
    },[]);

    const handleSendData = (data:DescMainData) => {
      setLoading(true);
      fetch("/api/descmain", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(data => {
        console.log(data);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
    }

    return (
        <form onSubmit={handleSubmit(handleSendData)} style={{maxWidth: "550px", margin: "0 auto"}}>
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
              width: "100%"
            }}>
            <Typography
              component="label"
              htmlFor="desc"
              sx={{
                position: "absolute",
                top: "-9px",
                left: "10px",
                fontSize: "12px",
                padding: "0 5px",
                color: errors.description ? "red" : "#cfd8dc",
                backgroundColor: "rgb(36, 36, 36)",
              }}
            >
              Opis
            </Typography>
            <CTextArea
              id="desc"
              style={{ height: "110px", ...{...(errors.description ? {borderColor: "red"} : {})} }}
              {...register("description", {
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
            {errors.description && (
              <span
                style={{
                  color: "red",
                  width: "100%",
                  display: "block",
                  textAlign: "left",
                  fontSize: "12px",
                  letterSpacing: "0.75px",
                  paddingLeft: "20px",
                  opacity: "0.7"
                }}
              >
                  {errors.description.message}
              </span>
            )}
          </Box>
          <Box>
            <>
              <h2>Mocne strony</h2>
              {fields.map((pro:any, i:number) => {
                const image = watch(`pros.${i}.img`);

                return (
                <div
                  key={pro.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "80px"
                  }}
                >
                  <img
                    style={{ maxHeight: "56px", maxWidth: "56px", ...{...errors.pros?.[i]?.desc ? {marginBottom: "20px"} : {}}}}
                    src={
                      typeof image === "object"
                        ? URL.createObjectURL(image?.[0])
                        : image
                        ? `/images/${image}`
                        : "/images/vercel.svg"
                    }
                    alt="logo"
                  />
                  <Controller
                    control={control}
                    name={`pros.${i}.desc`}
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
                        label="Nazwa"
                        sx={{ width: "100%" }}
                        value={value}
                        onChange={onChange}
                        onBlur={onBlur}
                        inputRef={ref}
                        error={Boolean(errors.pros?.[i]?.desc)}
                        helperText={errors.pros?.[i]?.desc?.message as string}
                      />
                    )}
                  />
                  <label htmlFor={`pros.${i}.img`}>
                    <Input
                      {...register(`pros.${i}.img`, {
                        required: "Wymagane!"
                      })}
                    />
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      sx={{color: blueGrey[700], ...{...errors.pros?.[i]?.desc ? {marginBottom: "20px"} : {}}}}
                    >
                      <CameraAltIcon/>
                    </IconButton>
                  </label>
                  <IconButton
                    onClick={() => remove(i)}
                    color="primary"
                    aria-label="delete item"
                    component="span"
                    sx={{color: blueGrey[700], ...{...errors.pros?.[i]?.desc ? {marginBottom: "20px"} : {}}}}
                  >
                    <DeleteIcon/>
                  </IconButton>
                </div>
              )})}
              {fields.length < 3 &&
                <IconButton onClick={() => append({img: "", desc: ""})} sx={{color: "white"}}>
                  <AddIcon/>
                </IconButton>
              }
            </>
          </Box>
          <CLoadingButton loading={loading} disabled={loading} startIcon={<SaveIcon/>} loadingPosition="start" type="submit">
            Zapisz
          </CLoadingButton>
        </form>
    )
}
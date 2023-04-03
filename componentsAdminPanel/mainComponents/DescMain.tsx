/* eslint-disable @next/next/no-img-element */
import DescMainData from "@/lib/types/DescMainData";
import { Box, IconButton, Typography, styled } from "@mui/material";
import { useEffect, useState } from "react";
import {
  Controller,
  useForm,
  useFieldArray,
  UseFormRegisterReturn,
} from "react-hook-form";
import CTextArea from "../elements/CTextArea";
import CTextField from "../elements/CTextField";
import AddIcon from "@mui/icons-material/Add";
import CLoadingButton from "../elements/CLoadingButton";
import SaveIcon from "@mui/icons-material/Save";
import React from "react";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { blueGrey } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import CButton from "../elements/CButton";
import Link from "next/link";
import ImageSelect from "../ImageSelect";

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

// eslint-disable-next-line react/display-name
const Input = React.forwardRef(
  ({ onChange, onBlur, name }: UseFormRegisterReturn, ref: any) => (
    <InputStyled
      id={name}
      type="text"
      onChange={(e: any) => null as any}
      onBlur={onBlur}
      name={name}
      ref={ref}
    />
  )
);

export default function DescMain() {
  const [loading, setLoading] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [curSelect, setCurSelect] = useState<number>(0);
  const {
    control,
    formState: { errors },
    register,
    handleSubmit,
    watch,
    setValue,
  } = useForm<DescMainData>({
    defaultValues: async () => {
      const res = await fetch("/api/descmain").then((res) => res.json());
      setLoading(false);
      return res as any;
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "pros",
    control,
  });

  const handleSendData = (data: DescMainData) => {
    setLoading(true);

    fetch("/api/descmain", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setLoading(false);
        } else {
          console.log("err");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(handleSendData)}
        style={{ maxWidth: "550px", margin: "0 auto" }}
      >
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
                : errors.description
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
                  : errors.description
                  ? {
                      borderColor: "red",
                      color: "red",
                    }
                  : {}),
              },
            }}
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
                opacity: "0.7",
              }}
            >
              {errors.description.message}
            </span>
          )}
        </Box>
        <Box>
          <>
            <h2>Mocne strony</h2>
            {fields.map((pro: any, i: number) => {
              const image = watch(`pros.${i}.img`);

              return (
                <div
                  key={pro.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "80px",
                  }}
                >
                  <img
                    style={{
                      maxHeight: "56px",
                      maxWidth: "56px",
                      ...{
                        ...(errors.pros?.[i]?.desc
                          ? { marginBottom: "20px" }
                          : {}),
                      },
                    }}
                    src={
                      image
                        ? `https://barberianextjs.s3.eu-central-1.amazonaws.com/${image}`
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
                    render={({
                      field: { onChange, onBlur, value, ref, name },
                    }) => (
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
                  <Input
                    disabled={loading}
                    {...register(`pros.${i}.img`, {
                      required: "Wymagane!",
                    })}
                  />
                  <IconButton
                    color="primary"
                    disabled={loading}
                    aria-label="upload picture"
                    component="span"
                    onClick={() => {
                      setCurSelect(i);
                      setOpen(true);
                    }}
                    sx={{
                      color: errors.pros?.[i]?.img ? "red" : blueGrey[700],
                      ...{
                        ...(errors.pros?.[i]?.desc
                          ? { marginBottom: "20px" }
                          : {}),
                      },
                    }}
                  >
                    <CameraAltIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => remove(i)}
                    color="primary"
                    disabled={loading}
                    aria-label="delete item"
                    component="span"
                    sx={{
                      color: blueGrey[700],
                      ...{
                        ...(errors.pros?.[i]?.desc
                          ? { marginBottom: "20px" }
                          : {}),
                      },
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              );
            })}
            {fields.length < 3 && (
              <IconButton
                disabled={loading}
                onClick={() => append({ img: "", desc: "" })}
                sx={{ color: "white" }}
              >
                <AddIcon />
              </IconButton>
            )}
          </>
        </Box>
        <CButton
          disabled={loading}
          LinkComponent={Link}
          href="/admin/menuconfig#edit"
        >
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
          setSelectedImage={(name: string) =>
            setValue(`pros.${curSelect}.img`, name)
          }
        />
      )}
    </>
  );
}

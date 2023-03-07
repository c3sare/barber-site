import DescMainData from "@/lib/types/DescMainData";
import { Box, IconButton, Typography } from "@mui/material";
import { useState } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form"
import CTextArea from "../elements/CTextArea";
import CTextField from "../elements/CTextField";
import AddIcon from '@mui/icons-material/Add';

export default function DescMain() {
    const [loading, setLoading] = useState<boolean>(false);
    const {control, formState: {errors}, register, handleSubmit} = useForm<DescMainData>();
    const {fields, append, remove} = useFieldArray({
        name: "pros",
        control,
    })

    const handleSendData = (data:DescMainData) => {
        console.log(data);
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
          <Box justifyContent="center" sx={{position: "relative"}}>
            <Typography
              component="label"
              htmlFor="desc"
              sx={{
                position: "absolute",
                top: "-1px",
                left: "19px",
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
              <span style={{ color: "red" }}>{errors.description.message}</span>
            )}
          </Box>
          <Box>
            <>
            <h2>Mocne strony</h2>
            {fields.map((pro:any, i:number) => {
                <div key={pro.id}>
                    <Controller
                        control={control}
                        name={`pros.${i}.desc`}
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

                </div>
            })}
            <IconButton onClick={() => append({img: "", desc: ""})}>
                <AddIcon/>
            </IconButton>
            </>
          </Box>
        </form>
    )
}
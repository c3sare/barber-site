import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import CButton from "../elements/CButton";
import CLoadingButton from "../elements/CLoadingButton";
import CTextField from "../elements/CTextField";
import SaveIcon from '@mui/icons-material/Save';
import { FormControlLabel } from "@mui/material";
import CCheckbox from "../elements/CCheckBox";

const days = [
    {
        short: "pon",
        name: "Poniedziałek"
    },
    {
        short: "wto",
        name: "Wtorek"
    },
    {
        short: "sro",
        name: "Środa"
    },
    {
        short: "czw",
        name: "Czwartek"
    },
    {
        short: "pia",
        name: "Piątek"
    },
    {
        short: "sob",
        name: "Sobota"
    },
    {
        short: "nie",
        name: "Niedziela"
    },
];

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

interface openHours {
    short: string,
    closed: boolean,
    start?: string,
    end?: string,
}

export default function OpenHours() {
    const {control, handleSubmit, formState: {errors}, getValues, clearErrors, setError, watch} = useForm();
    const [loading, setLoading] = useState<boolean>(false);

    const handleSendData = (data:any) => {
        const newTab:openHours[] = [];
        const keys = Object.keys(data);
        keys.forEach(key => {
            const time = data[key].closed ? {
                closed: true
            }
            : {
                closed: false,
                start: data[key].start,
                end: data[key].end
            }

            newTab.push({
                short: key,
                ...time
            })
        });
        setLoading(true);
        fetch("/api/openhours", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newTab)
        })
        .then(res => res.json())
        .then(data => {
            if(!data.error) {

            } else {
                console.log("Wystąpił błąd przy aktualizacji!");
            }
        })
        .catch((err) => console.log(err))
        .finally(() => setLoading(false))
    }

    return (
        <form onSubmit={handleSubmit(handleSendData)}>
            {days.map(day => {
                const closed = watch(`${day.short}.closed`);

                return (
                <div key={day.short} style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <div style={{paddingRight: "16px", width: "150px", textAlign: "left"}}>{day.name}</div>
                    <div>od</div>
                    <Controller
                        control={control}
                        name={`${day.short}.start`}
                        rules={{
                            validate: val => {
                                if(getValues(`${day.short}.closed`)) {
                                    return true;
                                }

                                if(val === undefined || getValues(`${day.short}.end`) === undefined || !timeRegex.test(val)) return false;
                                const x = val.split(":");
                                const y = getValues(`${day.short}.end`).split(":");
                                if(
                                    x[0] === y[0] && x[1] < y[1] ||
                                    x[0] < y[0] 
                                ) {
                                    clearErrors(`${day.short}.end`);
                                    return true;
                                } else {
                                    setError(`${day.short}.end`, {message: "!"});
                                    return false;
                                }
                            }
                        }}
                        render={({field:{name, value, onChange, onBlur, ref}}) => (
                            <CTextField
                                disabled={loading || closed}
                                sx={{width: "80px"}}
                                variant="standard"
                                name={name}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                inputRef={ref}
                                type="time"
                                error={Boolean((errors as any)[day.short]?.start)}
                            />
                        )}
                    />
                    <div>do</div>
                    <Controller
                        control={control}
                        name={`${day.short}.end`}
                        rules={{
                            validate: val => {
                                if(getValues(`${day.short}.closed`)) {
                                    return true;
                                }

                                if(val === undefined || getValues(`${day.short}.start`) === undefined || !timeRegex.test(val)) return false;

                                const x = getValues(`${day.short}.start`).split(":");
                                const y = val.split(":");
                                if(
                                    x[0] === y[0] && x[1] < y[1] ||
                                    x[0] < y[0] 
                                ) {
                                    clearErrors(`${day.short}.start`);
                                    return true;
                                } else {
                                    setError(`${day.short}.start`, {message: "!"});
                                    return false;
                                }
                            }
                        }}
                        render={({field:{name, value, onChange, onBlur, ref}}) => (
                            <CTextField
                                disabled={loading || closed}
                                sx={{width: "80px"}}
                                variant="standard"
                                name={name}
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                inputRef={ref}
                                type="time"
                                error={Boolean((errors as any)[day.short]?.end)}
                            />
                        )}
                    />
                    <Controller
                      control={control}
                      name={`${day.short}.closed`}
                      render={({ field: { onChange, onBlur, ref, name } }) => (
                        <FormControlLabel
                          label="Zamknięte"
                          control={
                            <CCheckbox
                                color="default"
                                name={name}
                                disabled={loading}
                                onBlur={onBlur}
                                inputRef={ref}
                                onChange={(e) => {
                                  clearErrors(day.short);
                                  onChange(e);
                                }}
                            />
                          }
                        />
                      )}
                    />
                </div>
            )})}
            <CButton disabled={loading} LinkComponent={Link} href="/admin/menuconfig#edit">
                Wróć
            </CButton>
            <CLoadingButton type="submit" loading={loading} disabled={loading} startIcon={<SaveIcon/>} loadingPosition="start">
                Zapisz
            </CLoadingButton>
        </form>
    )
}
import CButton from "@/componentsAdminPanel/elements/CButton";
import CCheckbox from "@/componentsAdminPanel/elements/CCheckBox";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout"
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { FormControlLabel } from "@mui/material";
import { Box } from "@mui/system";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import useSWR from "swr";
import SaveIcon from "@mui/icons-material/Save";

interface ReservationTime {
    reserved: boolean,
    mail: string,
    confirmed: boolean,
    person: string,
    phone: string
}

const AdminPanelIndex = ({permissions={}}: any) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const {data, isLoading, error} = useSWR(`/api/reservations/${router.query.id}/${router.query.date}/${router.query.time}`);
    const {control, formState: {errors}, handleSubmit} = useForm<ReservationTime>();

    const handleSendData = (data:any) => {
        setLoading(true);
        fetch(
            `/api/reservations/${
            router.query.id
            }/${
                router.query.date
            }/${
                router.query.time
            }`,
            {
                method: "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json"
                }
            }
        )
        .then(res => res.json())
        .then(res => {
            if(!res.error) {
                router.push("/admin/reservations");
            } else {
                console.log("error")
                setLoading(false);
            }
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        })
    }

    return (
        <Layout perms={permissions}>
            {isLoading ?
                <Loading/>
                :
                <>
                    <h1>Rezerwacja z dnia {router.query.date} - godzina {data.time}</h1>
                    <form onSubmit={handleSubmit(handleSendData)} style={{margin: "0 auto", maxWidth: "550px", textAlign: "center"}}>
                        <Box>
                            <Controller
                                control={control}
                                name="reserved"
                                defaultValue={data.reserved}
                                render={({ field: { onChange, onBlur, value, ref, name } }) => (
                                <FormControlLabel
                                    label="Zarezerwowane"
                                    control={
                                    <CCheckbox
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
                        </Box>
                        <Box>
                            <Controller
                                control={control}
                                name="mail"
                                defaultValue={data.mail}
                                rules={{
                                required: "To pole jest wymagane.",
                                pattern: {
                                    value:
                                    /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
                                    message: "Nieprawidłowo uzupełnione pole",
                                },
                                maxLength: {
                                    value: 50,
                                    message: "Max. ilość znaków to 50",
                                },
                                }}
                                render={({ field: { onChange, onBlur, value, ref, name } }) => (
                                <CTextField
                                    variant="outlined"
                                    label="Adres E-Mail"
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    name={name}
                                    value={value}
                                    inputRef={ref}
                                    error={Boolean(errors.mail)}
                                    helperText={errors.mail?.message}
                                />
                                )}
                            />
                        </Box>
                        <Box>
                            <Controller
                                control={control}
                                name="confirmed"
                                defaultValue={data.confirmed}
                                render={({ field: { onChange, onBlur, value, ref, name } }) => (
                                <FormControlLabel
                                    label="Potwierdzone"
                                    control={
                                    <CCheckbox
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
                        </Box>
                        <Box>
                            <Controller
                                control={control}
                                name="person"
                                defaultValue={data.person}
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
                                render={({ field: { onChange, onBlur, value, ref, name } }) => (
                                <CTextField
                                    variant="outlined"
                                    label="Rezerwujący"
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    name={name}
                                    value={value}
                                    inputRef={ref}
                                    error={Boolean(errors.person)}
                                    helperText={errors.person?.message}
                                />
                                )}
                            />
                        </Box>
                        <Box>
                            <Controller
                                control={control}
                                name="phone"
                                defaultValue={data.phone}
                                rules={{
                                required: "To pole jest wymagane.",
                                pattern: {
                                    value:
                                    /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/,
                                    message: "Nieprawidłowo uzupełnione pole",
                                },
                                maxLength: {
                                    value: 15,
                                    message: "Max. ilość znaków to 15",
                                },
                                }}
                                render={({ field: { onChange, onBlur, value, ref, name } }) => (
                                <CTextField
                                    variant="outlined"
                                    label="Numer telefonu"
                                    onChange={onChange}
                                    onBlur={onBlur}
                                    name={name}
                                    value={value}
                                    inputRef={ref}
                                    error={Boolean(errors.phone)}
                                    helperText={errors.phone?.message}
                                />
                                )}
                            />
                        </Box>
                        <CButton disabled={loading} LinkComponent={Link} href="/admin/reservations">Wróć</CButton>
                        <CLoadingButton startIcon={<SaveIcon/>} loading={loading} disabled={loading} loadingPosition="start" type="submit">
                            Zapisz
                        </CLoadingButton>
                    </form>
                </>
            }
        </Layout>
    )
}

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true || !user?.permissions?.reservations) {
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
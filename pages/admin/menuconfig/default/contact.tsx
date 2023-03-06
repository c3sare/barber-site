import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import React from "react";
import { useState } from "react";
import {Controller, useForm} from "react-hook-form";
import { IMaskInput } from "react-imask";
import SaveIcon from '@mui/icons-material/Save';
import { getDataOne } from "@/utils/getData";

const ZipCode = React.forwardRef(function TextMaskCustom(props:any, ref) {
  const { onChange, ...other }:any = props;
  return (
    <IMaskInput
      {...other}
      mask="00-000"
      definitions={{
        "#": /[1-9]/,
      }}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const EditDefaultPageContact = ({permissions={}, data}: any) => {
    const [loading, setLoading] = useState<boolean>(false);
    const {formState: {errors}, handleSubmit, register, control } = useForm({defaultValues: data});

    const handleSendForm = (data:any) => {
      setLoading(true);
      fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(res => res.json())
      .then(data => {
        console.log(data);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
    };

    return (
        <Layout perms={permissions}>
          <h1>Kontakt</h1>
          <form
            onSubmit={handleSubmit(handleSendForm)}
            style={{ maxWidth: "452px", margin: "0 auto", textAlign: "center" }}
          >
            <div>
              <Controller
                control={control}
                name="nip"
                rules={{
                  required: "To pole jest wymagane.",
                  maxLength: {
                    value: 10,
                    message: "Nieprawidłowy numer NIP",
                  },
                  minLength: {
                    value: 10,
                    message: "Nieprawidłowy numer NIP",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="outlined"
                    sx={{ margin: "8px 0", width: "100%" }}
                    label="NIP"
                    onChange={(e) => {
                      if (e.target.value.length > 10) {
                        return;
                      }
                      e.target.value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*?)\..*/g, "$1");
                      onChange(e);
                    }}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    error={Boolean(errors.nip)}
                    helperText={errors.nip?.message as string}
                  />
                )}
              />
              <Controller
                control={control}
                name="regon"
                rules={{
                  minLength: {
                    value: 9,
                    message: "Nieprawidłowy numer REGON",
                  },
                  maxLength: {
                    value: 9,
                    message: "Nieprawidłowy numer REGON",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="outlined"
                    sx={{ margin: "8px 0", width: "100%" }}
                    label="REGON"
                    onChange={(e) => {
                      if (e.target.value.length > 9) {
                        return;
                      }
                      e.target.value = e.target.value
                        .replace(/[^0-9.]/g, "")
                        .replace(/(\..*?)\..*/g, "$1");
                      onChange(e);
                    }}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    error={Boolean(errors.regon)}
                    helperText={errors.regon?.message as string}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                control={control}
                name="mail"
                rules={{
                  required: "To pole jest wymagane.",
                  pattern: {
                    value: /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
                    message: "Nieprawidłowo uzupełnione pole",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="outlined"
                    sx={{ margin: "8px 0", width: "100%" }}
                    label="E-Mail"
                    onChange={onChange}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    error={Boolean(errors.mail)}
                    helperText={errors.mail?.message as string}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                rules={{
                  required: "To pole jest wymagane.",
                  pattern: {
                    value:
                      /(?<!\w)(\(?(\+|00)?48\)?)?[ -]?\d{3}[ -]?\d{3}[ -]?\d{3}(?!\w)/,
                    message: "Nieprawidłowo numer telefonu",
                  },
                  maxLength: {
                    value: 15,
                    message: "Max. ilość znaków to 15",
                  },
                  minLength: {
                    value: 9,
                    message: "Nieprawidłowo numer telefonu",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="outlined"
                    sx={{ margin: "8px 0", width: "100%" }}
                    label="Telefon"
                    onChange={(e) => {
                      if (e.target.value.length > 15) {
                        return;
                      }
                      e.target.value = e.target.value
                        .replace(/[^0-9+]/g, "")
                        .replace(/(\..*?)\..*/g, "$1");
                      onChange(e);
                    }}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    error={Boolean(errors.phone)}
                    helperText={errors.phone?.message as string}
                  />
                )}
              />
            </div>
            <Controller
              control={control}
              name="address"
              rules={{
                required: "To pole jest wymagane.",
                pattern: {
                  value: /^[0-9a-zA-ZąĄęĘćĆłŁóÓńŃśŚżŻźŹ -./]+$/u,
                  message: "Nieprawidłowo uzupełnione pole",
                },
                maxLength: {
                  value: 50,
                  message: "Max. ilość znaków to 50",
                },
              }}
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <CTextField
                  disabled={loading}
                  variant="outlined"
                  sx={{ margin: "8px 0", width: "100%" }}
                  label="Adres"
                  onChange={onChange}
                  onBlur={onBlur}
                  value={value}
                  inputRef={ref}
                  error={Boolean(errors.address)}
                  helperText={errors.address?.message as string}
                />
              )}
            />
            <div style={{width: "100%"}}>
              <Controller
                control={control}
                name="zipcode"
                rules={{
                  required: "To pole jest wymagane.",
                  pattern: {
                    value: /^\d{2}(?:[-\s]\d{3})?$/,
                    message: "Nieprawidłowy kod pocztowy",
                  },
                  maxLength: {
                    value: 6,
                    message: "Nieprawidłowy kod pocztowy",
                  },
                  minLength: {
                    value: 6,
                    message: "Nieprawidłowy kod pocztowy",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="outlined"
                    sx={{ margin: "8px 8px 8px 0", width: "130px" }}
                    label="Kod pocztowy"
                    onChange={(e) => {
                      if (e.target.value.length > 6) {
                        return;
                      }
                      e.target.value = e.target.value
                        .replace(/[^0-9-]/g, "")
                        .replace(/(\..*?)\..*/g, "$1");
                      onChange(e);
                    }}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    InputProps={{
                      inputComponent: ZipCode,
                    }}
                    error={Boolean(errors.zipcode)}
                    helperText={errors.zipcode?.message as string}
                  />
                )}
              />
              <Controller
                control={control}
                name="city"
                rules={{
                  required: "To pole jest wymagane.",
                  pattern: {
                    value: /^[a-zA-ZąĄęĘćĆłŁóÓńŃśŚżŻźŹ -]+$/u,
                    message: "Nieprawidłowo uzupełnione pole",
                  },
                  maxLength: {
                    value: 30,
                    message: "Max. ilość znaków to 30",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="outlined"
                    sx={{ margin: "8px 0", width: "calc(100% - 138px)" }}
                    label="Miasto"
                    onChange={(e) => {
                      if (e.target.value.length > 30) {
                        return;
                      }
                      e.target.value = e.target.value
                        .replace(/[^a-zA-ZąĄęĘćĆłŁóÓńŃśŚżŻźŹ ]/g, "")
                        .replace(/(\..*?)\..*/g, "$1");
                      onChange(e);
                    }}
                    onBlur={onBlur}
                    value={value}
                    inputRef={ref}
                    error={Boolean(errors.city)}
                    helperText={errors.city?.message as string}
                  />
                )}
              />
            </div>
            <CLoadingButton loading={loading} disabled={loading} loadingPosition="start" startIcon={<SaveIcon/>} type="submit">
              Zapisz zmiany
            </CLoadingButton>
          </form>
        </Layout>
    )
}

export default EditDefaultPageContact;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true || !user?.permissions.menu) {
        return {
          notFound: true,
        };
      }

      const data = await getDataOne("contact");
  
      return {
        props: {
          data,
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
import CButton from "@/componentsAdminPanel/elements/CButton";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import { getDataOne } from "@/utils/getData";
import { Box, Grid } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaSave } from "react-icons/fa";

const AdminPanelBasicConfig = ({permissions, data}: any) => {
  const currentYear = new Date().getFullYear();
  const [msg, setMsg] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const companyName = register("companyName", {
    required: true,
    pattern: /^[a-zA-Z][a-zA-Z0-9-_.\s]{1,20}$/i,
    minLength: 2,
    maxLength: 20,
  });
  const slogan = register("slogan", {
    maxLength: 20,
    pattern: /^[a-zA-Z][a-zA-Z0-9-_.\s]{1,20}$/i,
  });
  const {onBlur, onChange, ref, name } = register("yearOfCreate", {
    required: true,
    pattern: /^\d{4}$/i,
    min: 1900,
    max: currentYear,
  });

  const handleSendForm = (data:any) => {
    fetch("/api/info", {
      method: "POST",
      body: JSON.stringify(data),
    })
      .then(data => data.json())
      .then((data:any) => {
        if (data.error === false) {
          setMsg("Dane zostały zaktualizowane!");
          setTimeout(() => setMsg(""), 5000);
        } else {
          setMsg("Nie można w tej chwili zaktualizować danych!");
          setTimeout(() => setMsg(""), 5000);
        }
      })
      .catch((error:any) => {
        console.log(error);
        setMsg("Wystąpił błąd przy wysyłaniu!");
        setTimeout(() => setMsg(""), 5000);
      });
  };

    return (
        <Layout perms={permissions}>
          <h1>Podstawowa Konfiguracja</h1>
          <Grid
            container
            alignItems="center"
            justifyContent="center"
            direction="column"
          >
            <form onSubmit={handleSubmit(handleSendForm)} autoComplete="off">
              <Box pb={2}>
                <CTextField
                  {...companyName}
                  defaultValue={data.companyName}
                  variant="outlined"
                  id="companyName"
                  label="Nazwa Strony"
                  error={errors.companyName ? true : false}
                  helperText={
                    errors.companyName ? "Pole nie może być puste!" : false
                  }
                />
              </Box>

              <Box pb={2}>
                <CTextField
                  {...slogan}
                  defaultValue={data.slogan}
                  variant="outlined"
                  id="slogan"
                  label="Motto"
                  error={errors.slogan ? true : false}
                  helperText={
                    errors.slogan ? "Minimum 2 znaki, Maxymalnie 20!" : false
                  }
                />
              </Box>
              <Box pb={2}>
                <CTextField
                  fullWidth
                  onChange={(e) => {
                    if(Number(e.target.value) < 1900) {
                      e.target.value = "1900"
                    } else if(Number(e.target.value) > currentYear) {
                      e.target.value = `${currentYear}`;
                    }
                      onChange(e);
                  }}
                  onBlur={onBlur}
                  name={name}
                  inputRef={ref}
                  defaultValue={data.yearOfCreate}
                  variant="outlined"
                  type="number"
                  id="yearOfCreate"
                  label="Rok założenia"
                  error={errors.yearOfCreate ? true : false}
                  helperText={
                    errors.yearOfCreate
                      ? `Przedział od 1900 do ${currentYear}!`
                      : false
                  }
                  InputProps={{ inputProps: { min: 1900, max: currentYear } }}
                />
              </Box>
              <CButton startIcon={<FaSave />} type="submit" variant="contained" sx={{width: "100%"}}>
                Zapisz zmiany
              </CButton>
            </form>
            {msg.length > 0 && <h5 style={{ textAlign: "center" }}>{msg}</h5>}
          </Grid>
        </Layout>
    )
}

export default AdminPanelBasicConfig;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true || !user?.permissions?.basic) {
        return {
          redirect: {
            destination: '/admin',
            permanent: false,
          },
        };
      }

      const data = await getDataOne("info");
  
      return {
        props: {
          data,
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
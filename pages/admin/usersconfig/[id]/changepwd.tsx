import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Box } from "@mui/material";
import Users from "@/models/User";
import { ObjectId } from "mongodb";

interface ChangePWD {
  password: string;
  repassword: string;
}

const AdminPanelIndex = ({ permissions = {}, data }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<ChangePWD>();

  const sendData = (data: ChangePWD) => {
    setLoading(true);
    fetch("/api/users/" + router.query.id + "/changepwd", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          router.push("/admin/usersconfig");
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
    <Layout perms={permissions}>
      <h1>Zmiana hasła dla użytkownika - {data.login}</h1>
      <form
        onSubmit={handleSubmit(sendData)}
        style={{
          width: "100%",
          maxWidth: "550px",
          textAlign: "center",
          margin: "0 auto",
        }}
      >
        <Box>
          <Controller
            defaultValue=""
            control={control}
            name="password"
            rules={{
              pattern: {
                value:
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                message: "Hasło musi spełniać wymogi bezpieczeństwa",
              },
              required: "To pole jest wymagane.",
              maxLength: {
                value: 32,
                message: "Max. ilość znaków to 32",
              },
              minLength: {
                value: 8,
                message: "Min. ilość znaków to 8",
              },
              validate: (val) => val === getValues("repassword"),
            }}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <CTextField
                fullWidth
                disabled={loading}
                type="password"
                variant="outlined"
                label="Hasło"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors.password)}
                helperText={errors.password?.message}
                autoComplete="new-password"
              />
            )}
          />
        </Box>
        <Box>
          <Controller
            defaultValue=""
            control={control}
            name="repassword"
            rules={{
              pattern: {
                value:
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                message: "Hasło musi spełniać wymogi bezpieczeństwa",
              },
              required: "To pole jest wymagane.",
              maxLength: {
                value: 32,
                message: "Max. ilość znaków to 32",
              },
              minLength: {
                value: 8,
                message: "Min. ilość znaków to 8",
              },
              validate: (val) =>
                val === getValues("password")
                  ? undefined
                  : "Hasła muszą być identyczne",
            }}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <CTextField
                fullWidth
                disabled={loading}
                type="password"
                variant="outlined"
                label="Powtórz Hasło"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors.repassword)}
                helperText={errors.repassword?.message}
                autoComplete="new-password"
              />
            )}
          />
        </Box>
        <CButton
          disabled={loading}
          LinkComponent={Link}
          href="/admin/usersconfig"
        >
          Wróć
        </CButton>
        <CLoadingButton
          disabled={loading}
          loading={loading}
          loadingPosition="start"
          startIcon={<SaveIcon />}
          type="submit"
        >
          Zmień hasło
        </CLoadingButton>
      </form>
    </Layout>
  );
};

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, query }) {
    const user = req.session.user;

    const data = JSON.parse(
      JSON.stringify(
        await Users.findOne({
          _id: new ObjectId(query.id as string),
        })
      )
    );

    if (user?.isLoggedIn !== true || !user?.permissions?.users || !data) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        data: {
          login: data.login,
          id: data._id,
        },
        permissions: user?.permissions,
      },
    };
  },
  sessionOptions
);

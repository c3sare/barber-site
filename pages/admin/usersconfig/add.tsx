import { Layout } from "@/componentsAdminPanel/Layout";
import CCheckbox from "@/componentsAdminPanel/elements/CCheckBox";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { Box, FormControlLabel } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import { Controller, useForm } from "react-hook-form";
import perms from "@/lib/permissions";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import CButton from "@/componentsAdminPanel/elements/CButton";
import Link from "next/link";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import { useRouter } from "next/router";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { Types } from "mongoose";

interface User {
  login: string;
  password: string;
  repassword: string;
  permissions: {
    [key: string]: boolean;
  };
}

const AdminPanelIndex = ({ permissions = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const {
    control,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm<User>();

  const sendData = (data: any) => {
    setLoading(true);
    fetch("/api/users", {
      method: "PUT",
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
          console.log("error");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const allPermissions: string[] = Object.keys(perms);

  return (
    <Layout perms={permissions}>
      <h1>Tworzenie nowego użytkownika</h1>
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
            name="login"
            rules={{
              pattern: {
                value: /^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{0,24}$/,
                message: "Nieprawidłowo wypełnione pole!",
              },
              required: "To pole jest wymagane.",
              maxLength: {
                value: 25,
                message: "Max. ilość znaków to 25",
              },
              minLength: {
                value: 5,
                message: "Min. ilość znaków to 5",
              },
            }}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <CTextField
                disabled={loading}
                fullWidth
                type="text"
                variant="outlined"
                label="Nazwa użytkownika"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors.login)}
                helperText={errors.login?.message}
                autoComplete="username"
              />
            )}
          />
        </Box>
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
        <Box>
          <h2>Uprawnienia</h2>
          {allPermissions.map((perm) => {
            return (
              <Controller
                key={perm}
                control={control}
                defaultValue={false}
                name={`permissions.${perm}`}
                render={({ field: { onChange, onBlur, value, ref, name } }) => (
                  <FormControlLabel
                    label={perms[perm]}
                    disabled={loading}
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
            );
          })}
        </Box>
        <CButton
          LinkComponent={Link}
          href="/admin/usersconfig"
          disabled={loading}
        >
          Wróć
        </CButton>
        <CLoadingButton
          disabled={loading}
          loading={loading}
          startIcon={<AddIcon />}
          loadingPosition="start"
          type="submit"
        >
          Dodaj użytkownika
        </CLoadingButton>
      </form>
    </Layout>
  );
};

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const session = req.session?.user;

    if (
      !session?.isLoggedIn ||
      !session?.id ||
      !Types.ObjectId.isValid(session?.id)
    ) {
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };
    }
    await dbConnect();
    const user = await User.findOne({ _id: new Types.ObjectId(session.id) });

    if (!user || !user?.permissions?.users)
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };

    return {
      props: {
        login: user.login,
        permissions: user.permissions,
      },
    };
  },
  sessionOptions
);

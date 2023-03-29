import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import SaveIcon from "@mui/icons-material/Save";
import { CostsData } from "@/lib/types/CostsData";
import CButton from "@/componentsAdminPanel/elements/CButton";
import Link from "next/link";
import { useRouter } from "next/router";
import Menu from "@/models/Menu";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { Types } from "mongoose";

const DefaultCostsAddItem = ({ permissions = {} }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  const {
    formState: { errors },
    control,
    handleSubmit,
  } = useForm<CostsData>({});

  const handleSendData = (form: any) => {
    setLoading(true);

    fetch("/api/costs", {
      method: "PUT",
      body: JSON.stringify(form),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          router.push("/admin/menuconfig/default/costs/" + data.id);
        } else {
          console.log("Wystąpił błąd! - " + data.msg);
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
      <h1>Cennik - Dodaj kategorię</h1>
      <form
        onSubmit={handleSubmit(handleSendData)}
        style={{ maxWidth: "550px", margin: "0 auto", textAlign: "center" }}
      >
        <Controller
          control={control}
          name="category"
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
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <CTextField
              name="category"
              disabled={loading}
              label="Tytuł kategorii"
              sx={{ width: "100%" }}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              inputRef={ref}
              error={Boolean(errors.category)}
              helperText={errors.category?.message as string}
            />
          )}
        />
        <CButton
          disabled={loading}
          LinkComponent={Link}
          href="/admin/menuconfig/default/costs"
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
          Dodaj
        </CLoadingButton>
      </form>
    </Layout>
  );
};

export default DefaultCostsAddItem;

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
    const node = await Menu.findOne({ slug: "costs", custom: false });

    if (!user || !user?.permissions?.menu || !node)
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };

    return {
      props: {
        permissions: user.permissions,
      },
    };
  },
  sessionOptions
);

import CButton from "@/componentsAdminPanel/elements/CButton";
import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import { useState } from "react";
import SaveIcon from "@mui/icons-material/Save";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/router";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Box } from "@mui/material";
import Barbers from "@/models/Barber";
import dbConnect from "@/lib/dbConnect";
import { Types } from "mongoose";

interface Worker {
  name: string;
}

const AdminPanelIndex = ({ permissions = {}, name }: any) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Worker>({
    defaultValues: {
      name,
    },
  });

  const handleSendData = ({ name }: Worker) => {
    setLoading(true);

    fetch("/api/workers/" + router.query.id, {
      method: "POST",
      body: JSON.stringify({ name }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          router.push("/admin/workersconfig");
        } else {
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
      <form
        onSubmit={handleSubmit(handleSendData)}
        style={{ margin: "0 auto", maxWidth: "550px", textAlign: "center" }}
      >
        <Box>
          <Controller
            control={control}
            name="name"
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
                label="Nazwa odnośnika"
                onChange={onChange}
                onBlur={onBlur}
                name={name}
                value={value}
                inputRef={ref}
                error={Boolean(errors?.name)}
                helperText={errors?.name?.message}
              />
            )}
          />
        </Box>
        <CButton
          LinkComponent={Link}
          disabled={loading}
          href="/admin/workersconfig"
        >
          Wróć
        </CButton>
        <CLoadingButton
          type="submit"
          loading={loading}
          startIcon={<SaveIcon />}
          loadingPosition="start"
        >
          Dodaj
        </CLoadingButton>
      </form>
    </Layout>
  );
};

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, query }) {
    const user = req.session.user;
    await dbConnect();
    const worker = JSON.parse(
      JSON.stringify(
        await Barbers.findOne({
          _id: new Types.ObjectId(query.id as string),
        })
      )
    );

    if (user?.isLoggedIn !== true || !user?.permissions?.workers || !worker) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        name: worker.name,
        permissions: user?.permissions,
      },
    };
  },
  sessionOptions
);

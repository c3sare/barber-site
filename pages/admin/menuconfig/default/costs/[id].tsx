import CLoadingButton from "@/componentsAdminPanel/elements/CLoadingButton";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { MenuItemDB } from "@/lib/types/MenuItem";
import { withIronSessionSsr } from "iron-session/next";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import SaveIcon from '@mui/icons-material/Save';
import { CostsData } from "@/lib/types/CostsData";
import CButton from "@/componentsAdminPanel/elements/CButton";
import { useRouter } from "next/router";
import {useEffect} from "react";
import { IconButton, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import getData from "@/utils/getData";
import Link from "next/link";


const DefaultCostsEditItem = ({permissions={}, data}: {permissions:any, data:CostsData}) => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const {
    formState: { errors },
    control,
    handleSubmit,
    setValue
  } = useForm<CostsData>({defaultValues: data});
  const { fields, append, remove, update } = useFieldArray<any>({
    control,
    name: "services"
  });

  const handleAddService = () => {
    if(fields.length < 5) {
      append({
        service: "",
        cost: 0,
        time: 0
      })
    }
  }

  const handleDeleteService = (i:number) => {
    remove(i)
  }

  const handleSendData = (form:CostsData) => {
    setLoading(true);
    fetch("/api/costs/"+router.query.id, {
      method: "POST",
      body: JSON.stringify(form),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then(res => res.json())
    .then(data => {
      if(!data.error) {
        router.push("/admin/menuconfig/default/costs");
      } else {
        console.log(data);
        setLoading(false)
      }
    })
    .catch(err => {
      console.log(err);
      setLoading(false);
    })
  };

  return (
    <Layout perms={permissions}>
      <h1>Edycja kategorii - {data.category}</h1>
      <form onSubmit={handleSubmit(handleSendData)} style={{maxWidth: "550px", margin: "0 auto", textAlign: "center"}}>
        <Controller
          control={control}
          name="category"
          defaultValue=""
          rules={{
            required: "To pole jest wymagane.",
            pattern: {
              value: /^(.|\s)*[a-zA-Z]+(.|\s)*$/,
              message: "Nieprawid??owo uzupe??nione pole",
            },
            maxLength: {
              value: 80,
              message: "Max. ilo???? znak??w to 80",
            },
          }}
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <CTextField
              disabled={loading}
              label="Tytu?? kategorii"
              sx={{ width: "calc(80% - 20px)" }}
              value={value}
              onChange={onChange}
              onBlur={onBlur}
              inputRef={ref}
              error={Boolean(errors.category)}
              helperText={errors.category?.message as string}
            />
          )}
        />
        <div>
          <h2>Us??ugi</h2>
          {fields.map((item:any, i:number) => (
            <div key={item.id}>
              <Controller
                control={control}
                name={`services.${i}.service`}
                rules={{
                  required: "To pole jest wymagane.",
                  pattern: {
                    value: /^(.|\s)*[a-zA-Z]+(.|\s)*$/,
                    message: "Nieprawid??owo uzupe??nione pole",
                  },
                  maxLength: {
                    value: 80,
                    message: "Max. ilo???? znak??w to 80",
                  },
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="filled"
                    label="Nazwa us??ugi"
                    sx={{
                      marginTop: "10px",
                      width: "calc(100% - 340px)",
                    }}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    inputRef={ref}
                    error={Boolean(
                      errors.services?.[i]?.service
                    )}
                    helperText={
                      errors.services?.[i]?.service?.message as string
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name={`services.${i}.cost`}
                rules={{
                  required: "To pole jest wymagane.",
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="filled"
                    sx={{ marginTop: "10px", width: "80px" }}
                    label="Cena"
                    type="number"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    inputRef={ref}
                    error={Boolean(
                      errors?.services?.[i]?.cost
                    )}
                    helperText={
                      errors?.services?.[i]?.cost?.message as string
                    }
                  />
                )}
              />
              <Controller
                control={control}
                name={`services.${i}.time`}
                rules={{
                  required: "To pole jest wymagane.",
                }}
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <CTextField
                    disabled={loading}
                    variant="filled"
                    sx={{ marginTop: "10px", width: "140px" }}
                    type="number"
                    label="Czas wykonania (min)"
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    inputRef={ref}
                    error={Boolean(
                      errors.services?.[i]?.time
                    )}
                    helperText={
                      errors.services?.[i]?.time?.message
                    }
                  />
                )}
              />
              <Tooltip title="Usu??" placement="bottom">
                <IconButton disabled={loading} onClick={() => handleDeleteService(i)} sx={{margin: "17px 0px", color: "#b0bec5", backgroundColor: "rgba(0, 0, 0, 0.06)"}}>
                    <DeleteIcon/>
                </IconButton>
              </Tooltip>
            </div>
          ))}
          {fields.length < 5 &&
            <CButton disabled={loading} onClick={handleAddService}>
              Dodaj us??ug??
            </CButton>
          }
        </div>
        <CButton LinkComponent={Link} href="/admin/menuconfig/default/costs">Wr????</CButton>
        <CLoadingButton
          loading={loading}
          disabled={loading}
          startIcon={<SaveIcon/>}
          loadingPosition="start"
          type="submit"
        >
          Zapisz zmiany
        </CLoadingButton>
      </form>
    </Layout>
  )
}

export default DefaultCostsEditItem;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req, query }) {
      const user = req.session.user;
      const menu:MenuItemDB[] = await getMenu();
      const costs:CostsData[] = await getData("costs");
  
      if(
        user?.isLoggedIn !== true ||
        !user?.permissions.menu ||
        menu.find(item => item.slug === "costs")?.custom ||
        !costs.find((item:any) => item._id === query.id)
      ) {
        return {
          notFound: true,
        };
      }
  
      return {
        props: {
          data: costs.find(item => item._id === query.id),
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
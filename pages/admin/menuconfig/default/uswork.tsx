import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { Grid, IconButton, Tooltip, styled } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import { ChangeEvent, useState } from "react";
import FaCamera from "@mui/icons-material/CameraAlt";
import UploadIcon from "@mui/icons-material/Upload";
import { blueGrey } from "@mui/material/colors";
import DeleteIcon from "@mui/icons-material/Delete";
import Image from "next/image";
import Loading from "@/componentsAdminPanel/Loading";
import WorkData from "@/lib/types/WorkData";
import CButton from "@/componentsAdminPanel/elements/CButton";
import Link from "next/link";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";
import Uswork from "@/models/Uswork";
import Menu from "@/models/Menu";
import dbConnect from "@/lib/dbConnect";

const Input = styled("input")({
  display: "none",
  color: "",
});

const UsworkConfig = ({ permissions, data }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [works, setWorks] = useState<WorkData[]>(data);
  const [deleteData, setDeleteData] = useState<{
    open: boolean;
    id: string;
    text: string;
  }>({ open: false, id: "", text: "" });
  const [image, setImage] = useState<File | null>(null);

  const handleAddUsWork = () => {
    if (image === null) return;
    else {
      const fd = new FormData();
      fd.append("file", image);
      setLoading(true);
      fetch("/api/uswork", {
        method: "PUT",
        body: fd,
      })
        .then((data) => data.json())
        .then((data) => {
          if (!data.error)
            setWorks((prevState) => [
              ...prevState,
              { _id: data._id, image: data.image },
            ]);
          else console.log("Wystąpił błąd przy dodawaniu obrazu!");
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
          setImage(null);
        });
    }
  };

  const handleDeleteWork = (id: string) => {
    setDeleteData({
      open: true,
      id,
      text: "Czy chcesz usunąć wybraną pracę?",
    });
  };

  return (
    <Layout perms={permissions}>
      <h2>Nasze prace</h2>
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <label htmlFor="contained-button-file">
            <Input
              disabled={loading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target?.files?.length === 1) setImage(e.target!.files[0]);
              }}
              accept="image/*"
              id="contained-button-file"
              type="file"
            />
            <IconButton
              disabled={loading}
              aria-label="upload picture"
              component="span"
              sx={{ color: `${blueGrey[700]}` }}
            >
              <FaCamera />
            </IconButton>
          </label>
          <img
            style={{ width: "100px", height: "100px", margin: "0 15px" }}
            src={
              image instanceof Blob
                ? URL.createObjectURL(image)
                : "/images/vercel.svg"
            }
            alt={`Obraz`}
          />
          <IconButton
            disabled={loading}
            onClick={handleAddUsWork}
            aria-label="send image"
            component="span"
            sx={{ color: `${blueGrey[700]}` }}
          >
            <UploadIcon />
          </IconButton>
        </div>
        <Grid container>
          {works.map((item: any) => (
            <Grid
              lg={4}
              sm={6}
              md={6}
              item
              sx={{ position: "relative" }}
              key={item._id}
            >
              <Image
                src={"/images/uswork/" + item.image}
                alt={item._id}
                priority
                width={500}
                height={500}
              />
              <Tooltip title="Usuń">
                <IconButton
                  sx={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    color: "black",
                    backgroundColor: "white",
                    "&:hover": {
                      color: "white",
                      backgroundColor: "black",
                    },
                  }}
                  onClick={() => handleDeleteWork(item._id)}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
        {loading && (
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "0",
              height: "100%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loading />
          </div>
        )}
      </div>
      <DeleteDialog
        setState={setWorks}
        open={deleteData}
        setOpen={setDeleteData}
        url="/api/uswork"
      />
      <CButton
        LinkComponent={Link}
        href="/admin/menuconfig#edit"
        sx={{
          margin: "0 auto",
          display: "block",
          width: "80px",
          textAlign: "center",
        }}
      >
        Wróć
      </CButton>
    </Layout>
  );
};

export default UsworkConfig;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    await dbConnect();
    const menu = await Menu.findOne({ slug: "uswork" });

    if (
      user?.isLoggedIn !== true ||
      !user?.permissions?.menu ||
      !menu ||
      menu?.custom
    ) {
      return {
        redirect: {
          destination: "/admin",
          permanent: false,
        },
      };
    }

    const data = JSON.parse(JSON.stringify(await Uswork.find({})));

    return {
      props: {
        data,
        permissions: req.session.user?.permissions,
      },
    };
  },
  sessionOptions
);

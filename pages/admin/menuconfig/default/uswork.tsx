/* eslint-disable @next/next/no-img-element */
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
import User from "@/models/User";
import { Types } from "mongoose";
import ImageSelect from "@/componentsAdminPanel/ImageSelect";

const Input = styled("input")({
  display: "none",
  color: "",
});

const UsworkConfig = ({ permissions, data }: any) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [works, setWorks] = useState<WorkData[]>(data);
  const [currentImage, setCurrentImage] = useState<string>("");
  const [open, setOpen] = useState<boolean>(false);
  const [deleteData, setDeleteData] = useState<{
    open: boolean;
    id: string;
    text: string;
  }>({ open: false, id: "", text: "" });

  const handleAddUsWork = () => {
    if (currentImage === "") return;
    setLoading(true);
    fetch("/api/uswork", {
      method: "PUT",
      body: JSON.stringify({
        name: currentImage,
      }),
      headers: {
        "Content-Type": "application/json",
      },
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
        setCurrentImage("");
      });
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
          <Input disabled={loading} type="text" id="contained-button-file" />
          <IconButton
            disabled={loading}
            aria-label="upload picture"
            component="span"
            onClick={() => setOpen(true)}
            sx={{ color: `${blueGrey[700]}` }}
          >
            <FaCamera />
          </IconButton>
          <img
            style={{ width: "100px", height: "100px", margin: "0 15px" }}
            src={
              currentImage
                ? "https://barberianextjs.s3.eu-central-1.amazonaws.com/" +
                  currentImage
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
                src={
                  "https://barberianextjs.s3.eu-central-1.amazonaws.com/" +
                  item.image
                }
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
      {open && (
        <ImageSelect
          setOpen={setOpen}
          setSelectedImage={(name: string) => setCurrentImage(name)}
        />
      )}
    </Layout>
  );
};

export default UsworkConfig;

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const session = req.session?.user;

    if (
      !session?.isLoggedIn ||
      !session?.id ||
      !Types.ObjectId.isValid(session?.id)
    ) {
      return {
        notFound: true,
      };
    }
    await dbConnect();
    const user = await User.findOne({ _id: new Types.ObjectId(session.id) });
    const node = await Menu.findOne({ slug: "uswork", custom: false });

    if (!user || !user?.permissions?.menu || !node)
      return {
        notFound: true,
      };

    const data = JSON.parse(JSON.stringify(await Uswork.find({})));

    return {
      props: {
        data,
        permissions: user.permissions,
      },
    };
  },
  sessionOptions
);

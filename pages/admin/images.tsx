import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";
import { Layout } from "@/componentsAdminPanel/Layout";
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import {
  createTheme,
  IconButton,
  styled,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import { Types } from "mongoose";
import Image from "next/image";
import { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { CameraAlt } from "@mui/icons-material";
import { blueGrey } from "@mui/material/colors";
import useSWR from "swr";

interface ImageObject {
  Key: string;
  LastModified: string;
  ETag: string;
  Size: number;
  StorageClass: "STANDARD";
}

const InputStyled = styled("input")({
  display: "none",
  color: "",
});

const theme = createTheme({
  palette: {
    primary: {
      main: blueGrey[700],
      contrastText: "white",
    },
  },
});

const AdminPanelImageList = ({ permissions = {} }: any) => {
  const { isLoading, error, data } = useSWR("/api/images");
  const [loading, setLoading] = useState<boolean>(false);
  const [list, setList] = useState<ImageObject[]>([]);
  const [dataDelete, setDataDelete] = useState({
    id: "",
    open: false,
    text: "",
  });

  useEffect(() => {
    if (data) setList(data);
  }, [data]);

  const upload = async (e: any) => {
    if (e.target?.files?.length === 1) {
      setLoading(true);
      const file = e.target.files[0];

      const res = await fetch("/api/images", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: file.name,
          type: file.type,
        }),
      }).then((data) => data.json());

      const { url, fields } = res;

      const formData = new FormData();

      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value as string);
      });

      const upload = await fetch(url, {
        method: "POST",
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: formData,
      });

      if (upload.ok) {
        console.log("Uploaded successfully!");
        fetch("/api/images")
          .then((res) => res.json())
          .then((data) => {
            setList(data);
          })
          .finally(() => setLoading(false));
      } else {
        console.error("Upload failed.");
        setLoading(false);
      }
    }
  };

  return (
    <Layout perms={permissions}>
      <h1>Obrazy</h1>
      <div style={{ width: "100%", textAlign: "center" }}>
        <ThemeProvider theme={theme}>
          <Tooltip title="Wgraj obraz">
            <label htmlFor="upload">
              <InputStyled
                accept="image/*"
                type="file"
                name="upload"
                id="upload"
                onChange={upload}
                disabled={loading}
              />
              <IconButton
                disabled={loading}
                color="primary"
                aria-label="upload picture"
                component="span"
              >
                <CameraAlt sx={{ fontSize: "50px", marginBottom: "25px" }} />
              </IconButton>
            </label>
          </Tooltip>
        </ThemeProvider>
      </div>
      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {isLoading ? (
          <Loading />
        ) : error ? (
          <span>Wystąpił problem przy pobieraniu danych!</span>
        ) : (
          list.map((item) => (
            <div
              style={{
                display: "inline-flex",
                width: "300px",
                maxWidth: "100%",
                height: "200px",
                position: "relative",
                border: "1px solid rgba(255, 255, 255, 0.3)",
                margin: "0 4px",
                alignItems: "center",
                justifyContent: "center",
              }}
              key={item.Key}
            >
              <img
                src={`https://barberianextjs.s3.eu-central-1.amazonaws.com/${item.Key}`}
                style={{
                  objectPosition: "center",
                  objectFit: "contain",
                  height: "auto",
                  width: "auto",
                  maxWidth: "100%",
                  maxHeight: "100%",
                }}
                alt={item.Key}
                sizes="(max-width: 768px) 300px,
                            (max-width: 1200px) 300px,
                            300px"
              />
              <IconButton
                disabled={loading}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  boxShadow: "0 0 3px white",
                  color: "white",
                }}
                onClick={() => {
                  setDataDelete({
                    id: item.Key,
                    text: `Czy chcesz usunąć grafikę ${item.Key}?`,
                    open: true,
                  });
                }}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))
        )}
      </div>
      <DeleteDialog
        id="Key"
        open={dataDelete}
        setOpen={setDataDelete}
        setState={setList}
        url={"/api/images"}
      />
    </Layout>
  );
};

export default AdminPanelImageList;

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

    if (!user)
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

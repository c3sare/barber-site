import CButton from "@/componentsAdminPanel/elements/CButton";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";
import { Layout } from "@/componentsAdminPanel/Layout";
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { WorkerData } from "@/lib/types/WorkerData";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { Types } from "mongoose";

const AdminPanelWorkersConfig = ({ permissions }: any) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [workers, setWorkers] = useState<WorkerData[]>([]);
  const [data, setData] = useState({ open: false, id: "", text: "" });

  useEffect(() => {
    let mounted = true;

    fetch("/api/workers")
      .then((data) => data.json())
      .then((data) => {
        if (mounted) setWorkers(data);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Layout perms={permissions}>
      <h1>Pracownicy</h1>
      <Box
        sx={{
          width: "100%",
          bgcolor: "rgb(45, 45, 45)",
          borderRadius: "5px",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <List sx={{ padding: "0" }}>
          {workers.map((item) => (
            <React.Fragment key={item._id}>
              <ListItem
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
                secondaryAction={
                  <>
                    <Tooltip title="Usuń" placement="bottom">
                      <IconButton
                        onClick={() =>
                          setData({
                            id: item._id,
                            open: true,
                            text:
                              "Czy chcesz usunąć wybranego pracownika? - " +
                              workers.find((itemf) => itemf._id === item._id)!
                                .name,
                          })
                        }
                        sx={{
                          margin: "0 5px",
                          color: "white",
                          boxShadow: "none",
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edytuj" placement="bottom">
                      <IconButton
                        LinkComponent={Link}
                        sx={{
                          margin: "0 5px",
                          color: "white",
                          boxShadow: "none",
                        }}
                        href={"/admin/workersconfig/" + item._id}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                <ListItemText primary={`${item.name}`} />
              </ListItem>
              <Divider sx={{ borderColor: "#4c4c4c" }} />
            </React.Fragment>
          ))}
          {loading && (
            <ListItem>
              <Loading />
            </ListItem>
          )}
        </List>
        <CButton LinkComponent={Link} href="/admin/workersconfig/add">
          Dodaj
        </CButton>
      </Box>
      <DeleteDialog
        setState={setWorkers}
        open={data}
        setOpen={setData}
        url="/api/workers"
      />
    </Layout>
  );
};

export default AdminPanelWorkersConfig;

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

    if (!user || !user.permissions?.workers)
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

import { Layout } from "@/componentsAdminPanel/Layout";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { CostsData } from "@/lib/types/CostsData";
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
import React, { useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import CButton from "@/componentsAdminPanel/elements/CButton";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";
import Menu from "@/models/Menu";
import Cost from "@/models/Cost";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { Types } from "mongoose";

const DefaultCostsEdit = ({ permissions = {}, costData }: any) => {
  const [state, setState] = useState<CostsData[]>(costData);
  const [data, setData] = useState({ id: "", open: false, text: "" });

  return (
    <Layout perms={permissions}>
      <h1>Cennik - Kategorie</h1>
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
          {state.map((item) => (
            <React.Fragment key={item._id}>
              <ListItem
                sx={{
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                  },
                }}
                secondaryAction={
                  <>
                    <Tooltip title="Usuń stronę" placement="bottom">
                      <IconButton
                        onClick={() =>
                          setData({
                            id: item._id,
                            open: true,
                            text:
                              "Czy chcesz usunąć wybraną kategorię? - " +
                              state.find((itemf) => itemf._id === item._id)!
                                .category,
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
                    <Tooltip title="Ustawienia" placement="bottom">
                      <IconButton
                        LinkComponent={Link}
                        sx={{
                          margin: "0 5px",
                          color: "white",
                          boxShadow: "none",
                        }}
                        href={"/admin/menuconfig/default/costs/" + item._id}
                      >
                        <SettingsIcon />
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                <ListItemText primary={`${item.category}`} />
              </ListItem>
              <Divider sx={{ borderColor: "#4c4c4c" }} />
            </React.Fragment>
          ))}
        </List>
        <CButton LinkComponent={Link} href="/admin/menuconfig#edit">
          Wróć
        </CButton>
        <CButton
          LinkComponent={Link}
          href="/admin/menuconfig/default/costs/add"
        >
          Dodaj
        </CButton>
      </Box>
      <DeleteDialog
        setState={setState}
        open={data}
        setOpen={setData}
        url="/api/costs"
      />
    </Layout>
  );
};

export default DefaultCostsEdit;

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

    const costData = JSON.parse(JSON.stringify(await Cost.find({})));

    return {
      props: {
        costData,
        permissions: user.permissions,
      },
    };
  },
  sessionOptions
);

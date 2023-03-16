import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { CostsData } from "@/lib/types/CostsData";
import { MenuItemDB } from "@/lib/types/MenuItem";
import getData from "@/utils/getData";
import { Box, Divider, IconButton, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import React, { useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import CButton from "@/componentsAdminPanel/elements/CButton";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";

const DefaultCostsEdit = ({permissions={}, costData}: any) => {
  const [state, setState] = useState<CostsData[]>(costData);
  const [data, setData] = useState({id: "", open: false, text: ""});

  return (
    <Layout perms={permissions}>
      <h1>Cennik - Kategorie</h1>
      <Box sx={{ width: '100%', bgcolor: 'rgb(45, 45, 45)', borderRadius: "5px", overflow: "hidden", textAlign: "center"}}>
        <List sx={{padding: "0"}}>
          {state.map(item => (
            <React.Fragment key={item._id}>
              <ListItem
                sx={{"&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)"
                }}}
                secondaryAction={
                  <>
                    <Tooltip title="Usuń stronę" placement="bottom">
                      <IconButton
                        onClick={() => setData({id: item._id, open: true, text: "Czy chcesz usunąć wybraną kategorię? - "+state.find(itemf => itemf._id === item._id)!.category})}
                        sx={{margin: "0 5px", color: "white", boxShadow: "none"}}
                      >
                        <DeleteIcon/>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Ustawienia" placement="bottom">
                      <IconButton LinkComponent={Link} sx={{margin: "0 5px", color: "white", boxShadow: "none"}} href={"/admin/menuconfig/default/costs/"+item._id}>
                        <SettingsIcon/>
                      </IconButton>
                    </Tooltip>
                  </>
                }
              >
                <ListItemText primary={`${item.category}`} />
              </ListItem>
              <Divider sx={{borderColor: "#4c4c4c"}}/>
            </React.Fragment>
          ))}
        </List>
        <CButton LinkComponent={Link} href="/admin/menuconfig#edit">Wróć</CButton>
        <CButton LinkComponent={Link} href="/admin/menuconfig/default/costs/add">
          Dodaj
        </CButton>
      </Box>
      <DeleteDialog setState={setState} open={data} setOpen={setData} url="/api/costs"/>
    </Layout>
    )
}

export default DefaultCostsEdit;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
      const menu:MenuItemDB[] = await getMenu();
  
      if (user?.isLoggedIn !== true || !user?.permissions?.menu || menu.find(item => item.slug === "costs")?.custom) {
        return {
          notFound: true,
        };
      }

      const data = await getData("costs");
  
      return {
        props: {
          costData: data,
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
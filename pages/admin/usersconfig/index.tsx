import CButton from "@/componentsAdminPanel/elements/CButton";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";
import { Layout } from "@/componentsAdminPanel/Layout"
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import PasswordIcon from '@mui/icons-material/Password';
import { Box, Divider, IconButton, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import SecurityIcon from '@mui/icons-material/Security';

const AdminPanelUsersConfig = ({permissions, login}: any) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({id: "", open: false, text: ""});

  useEffect(() => {
    fetch("/api/users")
    .then(res => res.json())
    .then(data => {
      if(data instanceof Array) {
        setUsers(data);
      }
    })
    .catch(err => console.log(err))
    .finally(() => setLoading(false));
  }, [])

    return (
        <Layout perms={permissions}>
        <h1>Użytkownicy Panelu</h1>
        <Box sx={{ width: '100%', bgcolor: 'rgb(45, 45, 45)', borderRadius: "5px", overflow: "hidden", textAlign: "center"}}>
          <List sx={{padding: "0"}}>
            {users.map((item:any) => (
              <React.Fragment key={item._id}>
                <ListItem
                  sx={{"&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}}
                  secondaryAction={
                    <>
                      {login !== item.login &&
                        <Tooltip title="Usuń" placement="bottom">
                          <IconButton
                            onClick={() => setData({id: item._id, open: true, text: "Czy chcesz usunąć wybranego użytkownika? - "+users.find((itemf:any) => itemf._id === item._id)!.login})}
                            sx={{margin: "0 5px", color: "white", boxShadow: "none"}}
                          >
                            <DeleteIcon/>
                          </IconButton>
                        </Tooltip>
                      }
                      <Tooltip title="Zmień hasło" placement="bottom">
                        <IconButton LinkComponent={Link} sx={{margin: "0 5px", color: "white", boxShadow: "none"}} href={"/admin/usersconfig/"+item._id+"/changepwd"}>
                          <PasswordIcon/>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Uprawnienia" placement="bottom">
                        <IconButton LinkComponent={Link} sx={{margin: "0 5px", color: "white", boxShadow: "none"}} href={"/admin/usersconfig/"+item._id+"/perms"}>
                          <SecurityIcon/>
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemText primary={`${item.login}`} />
                </ListItem>
                <Divider sx={{borderColor: "#4c4c4c"}}/>
              </React.Fragment>
            ))}
            {loading &&
              <ListItem><Loading/></ListItem>
            }
          </List>
          <CButton LinkComponent={Link} href="/admin/usersconfig/add">
            Dodaj
          </CButton>
        </Box>
        <DeleteDialog setState={setUsers} open={data} setOpen={setData} url="/api/users"/>
        </Layout>
    )
}

export default AdminPanelUsersConfig;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
      
      if (user?.isLoggedIn !== true || !user.permissions?.users) {
        return {
          notFound: true,
        };
      }
  
      return {
        props: {
          login: user.login,
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
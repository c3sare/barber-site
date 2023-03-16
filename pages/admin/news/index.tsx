import { Layout } from "@/componentsAdminPanel/Layout"
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import { Box, Divider, IconButton, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import React from "react";
import { useEffect, useState } from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from "next/link";
import CButton from "@/componentsAdminPanel/elements/CButton";
import NewsData from "@/lib/types/NewsData";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";

const AdminPanelNews = ({permissions}: any) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [news, setNews] = useState<NewsData[]>([]);
  const [data, setData] = useState({open: false, id: "", text: ""});

  useEffect(() => {
    let mounted = true;

    fetch("/api/news")
    .then(data => data.json())
    .then(data => {
      if(mounted)
        setNews(data);
    })
    .catch(err => console.log(err))
    .finally(() => {
      if(mounted)
       setLoading(false);
    });

    return () => {
      mounted = false;
    }
  }, [])

    return (
      <Layout perms={permissions}>
        <h1>Aktualności</h1>
        <Box sx={{ width: '100%', bgcolor: 'rgb(45, 45, 45)', borderRadius: "5px", overflow: "hidden", textAlign: "center"}}>
          <List sx={{padding: "0"}}>
            {news.map(item => (
              <React.Fragment key={item._id}>
                <ListItem
                  sx={{"&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}}
                  secondaryAction={
                    <>
                      <Tooltip title="Usuń" placement="bottom">
                        <IconButton
                          onClick={() => setData({id: item._id, open: true, text: "Czy chcesz usunąć wybrany artykuł? - "+news.find(itemf => itemf._id === item._id)!.title})}
                          sx={{margin: "0 5px", color: "white", boxShadow: "none"}}
                        >
                          <DeleteIcon/>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edytuj" placement="bottom">
                        <IconButton LinkComponent={Link} sx={{margin: "0 5px", color: "white", boxShadow: "none"}} href={"/admin/news/"+item._id}>
                          <SettingsIcon/>
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemText primary={`${item.title}`} />
                </ListItem>
                <Divider sx={{borderColor: "#4c4c4c"}}/>
              </React.Fragment>
            ))}
            {loading &&
              <ListItem><Loading/></ListItem>
            }
          </List>
          <CButton LinkComponent={Link} href="/admin/news/add">
            Dodaj
          </CButton>
        </Box>
        <DeleteDialog setState={setNews} open={data} setOpen={setData} url="/api/news"/>
      </Layout>
    )
}

export default AdminPanelNews;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true || !user?.permissions?.news) {
        return {
          notFound: true,
        };
      }
  
      return {
        props: {
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
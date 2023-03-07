import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { MenuItemDB } from "@/lib/types/MenuItem";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { withIronSessionSsr } from "iron-session/next";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useRouter } from "next/router";
import React from "react";
import SubjectIcon from '@mui/icons-material/Subject';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import DescMain from "@/componentsAdminPanel/mainComponents/DescMain";
import Slider from "@/componentsAdminPanel/mainComponents/Slider";
import OpenHours from "@/componentsAdminPanel/mainComponents/OpenHours";

const DefaultMainEdit = ({permissions={}}: any) => {
  const router = useRouter();
  const [value, setValue] = React.useState("slider");

  const handleChange = (_event:React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(router.route+"#"+newValue)
  };

  React.useEffect(() => {
    const haveHash = router.asPath.indexOf("#") > -1;
    const valueOfHash = router.asPath.slice(router.asPath.indexOf("#")+1);

    if(valueOfHash === "slider" || valueOfHash === "openhours" || valueOfHash === "descmain")
      setValue(
        haveHash ?
          valueOfHash
        :
          "slider"
      );
  }, [router.asPath]);

  return (
    <Layout perms={permissions}>
      <h1>Edycja Nawigacji</h1>
      <BottomNavigation
        sx={{
          width: 250,
          backgroundColor: "transparent",
          margin: "0 auto",
          marginBottom: "25px",
          "& > button": {
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.05)"
          },
          "& > .Mui-selected": {
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.15)"
          },
          "& > button:first-of-type": {
            borderRadius: "25px 0 0 25px"
          },
          "& > button:last-of-type": {
            borderRadius: "0 25px 25px 0"
          }
        }}
        value={value}
        onChange={handleChange}
      >
        <BottomNavigationAction
          label="Pokaz slajdów"
          value="slider"
          sx={{
            padding: "0px 12px",
            "&.Mui-selected": {
              color: "white"
            },
            "&>span": {
              opacity: "1",
              fontSize: "0.875rem"
            }
          }}
          icon={<SlideshowIcon />}
        />
        <BottomNavigationAction
          label="Treść"
          value="descmain"
          sx={{
            padding: "0px 12px",
            "&.Mui-selected": {
              color: "white"
            },
            "&>span": {
              opacity: "1",
              fontSize: "0.875rem"
            }
          }}
          icon={<SubjectIcon/>}
        />
        <BottomNavigationAction
          label="Godziny otwarcia"
          value="openhours"
          sx={{
            padding: "0px 12px",
            "&.Mui-selected": {
              color: "white"
            },
            "&>span": {
              opacity: "1",
              fontSize: "0.875rem"
            }
          }}
          icon={<AccessTimeIcon/>}
        />
      </BottomNavigation>
      <div style={{textAlign: "center"}}>
        {value === "slider" &&
          <Slider/>
        }
        {value === "descmain" &&
          <DescMain/>
        }
        {value === "openhours" &&
          <OpenHours/>
        }
      </div>
    </Layout>
  )
}

export default DefaultMainEdit;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
      const menu:MenuItemDB[] = await getMenu();
  
      if (user?.isLoggedIn !== true || !user?.permissions.menu || menu.find(item => item.slug === "")?.custom) {
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
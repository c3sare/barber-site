import CButton from "@/componentsAdminPanel/elements/CButton";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { withIronSessionSsr } from "iron-session/next";
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider, TreeItem } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';
import style from "@/styles/admin.module.css";

import ViewListIcon from '@mui/icons-material/ViewList';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';

import {MenuItemDB} from "@/lib/types/MenuItem";
import WebIcon from '@mui/icons-material/Web';
import { useEffect, useState } from "react";
import React from "react";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import { Tooltip } from "@mui/material";
import NoteAltIcon from '@mui/icons-material/NoteAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import Loading from "@/componentsAdminPanel/Loading";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";
import { useRouter } from "next/router";

interface MenuItemRCT {
  index: string,
  canMove: boolean,
  isFolder: boolean,
  children: string[],
  data: MenuItemDB,
  canRename: boolean
}


interface MenuItemSort {
  [key: string]: MenuItemRCT,
}

const startItem:MenuItemSort = {
  root: {
    index: 'root',
    canMove: true,
    isFolder: true,
    children: [],
    data: 'Root item' as any,
    canRename: true
  }
}

function changeData(data:MenuItemDB[]):MenuItemSort {
  let items = {...startItem};
  items.root.children = data.filter(item => item?.parent === "").map(item => item._id) as never[];

  data.forEach(item => {
    const id = item._id;
    items[id] = {
      index: item._id,
      canMove: !(item.slug === ""),
      isFolder: true,
      children: data.filter(sitem => sitem.parent === item._id).map(item => item._id),
      data: {...item},
      canRename: true
    }
  });

  return items;
}

function sortByOrder(a:MenuItemDB, b:MenuItemDB) {
  if(a.order > b.order) {
    return 1;
  } else if(a.order < b.order) {
    return -1;
  } else {
    return 0;
  }
}

function returnNormData(data:MenuItemSort):MenuItemDB[] {
  data["root"].children.forEach((item, i) => {
    data[item].data.order = i+1;
    data[item].data.parent = "";
  })

  const newData = {...data};
  const keys = Object.keys(newData).filter(item => item !== "root");

  keys.forEach((item:string, i:number) => {
    data[item].children.forEach((sitem:any) => {
      data[sitem].data.parent = item;
      data[sitem].data.order = i+1;
    });
  })

  const tab:any[] = [];
  keys.forEach((item) => {
    const obj = {...data[item].data};
    tab.push(obj)
  });

  return tab;
}

const SortPanel = () => {
  const [treeData, setTreeData] = useState<MenuItemSort | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/menu/sort")
    .then(data => data.json())
    .then(data => {
      if(!data.error) {
        if(mounted)
          setTreeData(changeData(data.menu.sort(sortByOrder)));
      } else {
        console.log("error");
      }
    })
    .catch(err => {
      console.error(err);
    });

    return () => {
      mounted = false;
    }
  }, []);

  const handleSendButton = (e:React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log(returnNormData(treeData as MenuItemSort));

    fetch("/api/menu/sort", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        menu: returnNormData(treeData as MenuItemSort)
      })
    })
    .then(data => data.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
  }

  return (
    treeData !== null ? 
    <>
      <UncontrolledTreeEnvironment
        dataProvider={new StaticTreeDataProvider(treeData)}
        getItemTitle={(item:TreeItem<MenuItemDB>) => item.data.title}
        viewState={{}}
        onDrop={() => setTreeData({...treeData})}
        canDragAndDrop={true}
        canDropOnFolder={true}
        canReorderItems={true}
      >
        <Tree treeId="tree-1" rootItem="root" treeLabel="Menu Tree" />
      </UncontrolledTreeEnvironment>
      <CButton onClick={handleSendButton} sx={{display: "block", margin: "5px auto"}} type="button">Zapisz kolejność</CButton>
    </>
    :
    <Loading/>
  )
}

const generateMenu = (tab:MenuItemDB[], setDialog:CallableFunction) => {
  return tab.map(item => (
    <li key={item._id}>
      <div>
        <span>{item.title}</span>
        {
          !item.on && 
            <span style={{color: "gainsboro", fontStyle: "italic", marginLeft: "15px"}}>(wyłączona)</span>
        }
      </div>
      <div>
        {item.custom ?
          <Tooltip title="Edytuj stronę niestandardową" placement="bottom">
            <IconButton LinkComponent={Link} href={"/admin/menuconfig/custom/"+item._id} sx={{margin: "0 5px"}}>
              <WebIcon/>
            </IconButton>
          </Tooltip>
          :
          <Tooltip title="Edytuj dane strony" placement="bottom">
            <IconButton LinkComponent={Link} sx={{margin: "0 5px"}}>
              <NoteAltIcon/>
            </IconButton>
        </Tooltip>
        }
        {!item.default &&
          <Tooltip title="Usuń stronę" placement="bottom">
            <IconButton
              sx={{margin: "0 5px"}}
              onClick={() => {
                setDialog({
                  id: item._id,
                  open: true
                })
              }}
            >
              <DeleteIcon/>
            </IconButton>
          </Tooltip>
        }
        <Tooltip title="Ustawienia" placement="bottom">
          <IconButton LinkComponent={Link} sx={{margin: "0 5px"}} href={"/admin/menuconfig/settings/"+item._id}>
            <SettingsIcon/>
          </IconButton>
        </Tooltip>
      </div>
  </li>
  ));
}

const EditPanel = () => {
  const [menu, setMenu] = useState<any>([]);
  const [dialog, setDialog] = useState({
    open: false,
    id: ""
  });

  useEffect(() => {
    let mounted = true;
    fetch("/api/menu")
    .then(data => data.json())
    .then(data => {
      if(!data.error) {
        if(mounted)
          setMenu(data.menu.sort(sortByOrder));
      } else {
        console.log("error");
      }
    })
    .catch(err => {
      console.error(err);
    });

    return () => {
      mounted = false;
    }
  }, [])

  return (
    menu.length > 0 ? (
      <>
      <CButton LinkComponent={Link} href="/admin/menuconfig/add">Dodaj węzeł nawigacji</CButton>
      <ul className={style.menuListEdit}>
        {generateMenu(menu, setDialog)}
      </ul>
      <DeleteDialog open={dialog} setOpen={setDialog} state={menu} setState={setMenu}/>
      </>
    )
    :
    <Loading/>
  )
}

const AdminPanelMenuConfig = ({permissions, menu}: any) => {
  const router = useRouter();
  const [value, setValue] = React.useState("sort");

  const handleChange = (_event:React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    router.push(router.route+"#"+newValue)
  };

  useEffect(() => {
    const haveHash = router.asPath.indexOf("#") > -1;
    const valueOfHash = router.asPath.slice(router.asPath.indexOf("#")+1);

    if(valueOfHash === "sort" || valueOfHash === "edit")
      setValue(
        haveHash ?
          valueOfHash
        :
          "sort"
      );
  }, [router.asPath])

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
          "& > button:nth-of-type(2)": {
            borderRadius: "0 25px 25px 0"
          }
        }}
        value={value}
        onChange={handleChange}
      >
        <BottomNavigationAction
          label="Sortuj"
          value="sort"
          icon={<ViewListIcon />}
        />
        <BottomNavigationAction
          label="Edytuj"
          value="edit"
          icon={<DriveFileRenameOutlineIcon />}
        />
      </BottomNavigation>
      {value === "sort" &&
        <SortPanel/>
      }
      {value === "edit" &&
        <EditPanel/>
      }
    </Layout>
  )
}

export default AdminPanelMenuConfig;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
      const menu = await getMenu();
  
      if (user?.isLoggedIn !== true || !user?.permissions.footer) {
        return {
          notFound: true,
        };
      }
  
      return {
        props: {
          permissions: req.session.user?.permissions,
          menu
        },
      };
    },
    sessionOptions
);
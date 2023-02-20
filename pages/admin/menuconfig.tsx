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
import Loading from "@/componentsAdminPanel/Loading";

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

function returnNormData(data:any):MenuItemDB[] {
  const newData = {...data};
  const keys = Object.keys(newData).filter(item => item !== "root");

  keys.forEach(item => {
    data[item].children.forEach((sitem:any) => {
      data[sitem].data.parent = item;
    })
  })

  const tab:any[] = [];
  keys.forEach((item, order) => {
    const obj = {...data[item].data};
    obj.order = order
    tab.push(obj)
  });

  return tab;
}

const SortPanel = () => {
  const [treeData, setTreeData] = useState<MenuItemSort | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/menu")
    .then(data => data.json())
    .then(data => {
      if(!data.error && mounted) {
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
    console.log(returnNormData(treeData));
  }

  return (
    treeData !== null ? 
    <>
      <UncontrolledTreeEnvironment
        dataProvider={new StaticTreeDataProvider(treeData, (item:TreeItem<MenuItemDB>, data:MenuItemDB) => ({ ...item, data }))}
        getItemTitle={(item:TreeItem<MenuItemDB>) => item.data.title}
        viewState={{}}
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

const generateMenu = (tab:MenuItemDB[]) => {
  return tab.map(item => (
    <li key={item._id}>
      <div>{item.title}</div>
      <div>
        <Tooltip title="Edytuj stronę" placement="bottom">
          <IconButton LinkComponent={Link} sx={{margin: "0 5px"}}>
            <WebIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Zmień dane" placement="bottom">
          <IconButton LinkComponent={Link} sx={{margin: "0 5px"}}>
            <NoteAltIcon/>
          </IconButton>
        </Tooltip>
        <Tooltip title="Usuń stronę" placement="bottom">
          <IconButton LinkComponent={Link} sx={{margin: "0 5px"}}>
            <DeleteIcon/>
          </IconButton>
        </Tooltip>
      </div>
  </li>
  ));
}

const EditPanel = () => {
  const [menu, setMenu] = useState<any>([]);

  useEffect(() => {
    let mounted = true;
    fetch("/api/menu")
    .then(data => data.json())
    .then(data => {
      if(!data.error && mounted) {
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
    menu.length > 0 ? <ul className={style.menuListEdit}>
      {generateMenu(menu)}
    </ul>
    :
    <Loading/>
  )
}

const AdminPanelMenuConfig = ({permissions, menu}: any) => {
  const [value, setValue] = React.useState('sort');

  const handleChange = (_event:React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
  };

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
import CButton from "@/componentsAdminPanel/elements/CButton";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { withIronSessionSsr } from "iron-session/next";
import { UncontrolledTreeEnvironment, Tree, StaticTreeDataProvider } from 'react-complex-tree';
import 'react-complex-tree/lib/style-modern.css';

import React, { useState } from "react";

import {MenuItemDB} from "@/lib/types/MenuItem";

const startItem:any = {
  root: {
    index: 'root',
    canMove: true,
    isFolder: true,
    children: [],
    data: 'Root item',
    canRename: true
  }
}

function changeData(data:MenuItemDB[]) {
  let items = {...startItem};
  items.root.children = data.filter(item => item?.parent === "").map(item => item._id);

  data.forEach(item => {
    items[item._id] = {
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

function sortByOrder(a:any, b:any) {
  if(a.order > b.order) {
    return 1;
  } else if(a.order < b.order) {
    return -1;
  } else {
    return 0;
  }
}

function returnNormData(data:any) {
  const newData = {...data};
  const keys = Object.keys(newData);

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

const AdminPanelMenuConfig = ({permissions, menu}: any) => {
  const [treeData, setTreeData] = useState<any>(changeData(menu.sort(sortByOrder)));

    return (
        <Layout perms={permissions}>
          <h1>Edycja Nawigacji</h1>
          <CButton>
            Dodaj nowy element
          </CButton>
          <UncontrolledTreeEnvironment
            dataProvider={new StaticTreeDataProvider(treeData, (item, data) => ({ ...item, data }))}
            getItemTitle={item => item.data.title}
            viewState={{}}
            canDragAndDrop={true}
            canDropOnFolder={true}
            canReorderItems={true}
          >
            <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example" />
          </UncontrolledTreeEnvironment>
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
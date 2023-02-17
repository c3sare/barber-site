import CButton from "@/componentsAdminPanel/elements/CButton";
import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { withIronSessionSsr } from "iron-session/next";

import React, { useState } from "react";
import styles from "@/styles/tree.module.css";
import { ThemeProvider, CssBaseline } from "@mui/material";
import {
  Tree,
  NodeModel,
  MultiBackend,
  getBackendOptions,
  DndProvider
} from "@minoru/react-dnd-treeview";

import { createTheme } from "@mui/material/styles";
import { TreeElement } from "@/componentsAdminPanel/elements/TreeElement";
import { TreeElementPlaceholder } from "@/componentsAdminPanel/elements/TreeElementPlaceholder";
import { TreeElementDragPreview } from "@/componentsAdminPanel/elements/TreeElementDragPreview";
import {MenuItemDB} from "@/lib/types/MenuItem";

export const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*": {
          margin: 0,
          padding: 0
        },
        "html, body, #root": {
          height: "100%"
        },
        ul: {
          listStyle: "none"
        }
      }
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: { verticalAlign: "middle" }
      }
    }
  }
});

function changeData(data:MenuItemDB[]) {
  return data.map((item:any, i:number) => {
    return ({
    id: i,
    parent: 0,
    droppable: true,
    text: item.title,
    data: {...item}
    })
  })
}

const AdminPanelMenuConfig = ({permissions, menu}: any) => {
  const [treeData, setTreeData] = useState<NodeModel[]>(changeData(menu));
  const handleDrop = (newTree: NodeModel[]) => setTreeData(newTree);

    return (
        <Layout perms={permissions}>
          <h1>Edycja Nawigacji</h1>
          <CButton>
            Dodaj nowy element
          </CButton>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <DndProvider backend={MultiBackend} options={getBackendOptions()}>
              <div className={styles.app}>
                <Tree
                  tree={treeData}
                  rootId={0}
                  sort={false}
                  insertDroppableFirst={false}
                  dropTargetOffset={10}
                  canDrop={(tree, { dragSource, dropTargetId }) => {
                    if (dragSource?.parent === dropTargetId) {
                      return true;
                    }
                  }}
                  render={(node, options) => <TreeElement node={node} {...options} />}
                  dragPreviewRender={(monitorProps) => (
                    <TreeElementDragPreview monitorProps={monitorProps} />
                  )}
                  placeholderRender={(node, { depth }) => (
                    <TreeElementPlaceholder node={node} depth={depth} />
                  )}
                  onDrop={handleDrop}
                  classes={{
                    root: styles.treeRoot,
                    draggingSource: styles.draggingSource,
                    placeholder: styles.placeholderContainer
                  }}
                />
              </div>
            </DndProvider>
          </ThemeProvider>
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
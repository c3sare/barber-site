import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import getMenu from "@/lib/getMenu";
import { MenuItemDB } from "@/lib/types/MenuItem";
import { withIronSessionSsr } from "iron-session/next";

const DefaultMainEdit = ({permissions={}}: any) => {

    return (
        <Layout perms={permissions}>

        </Layout>
    )
}

export default DefaultMainEdit;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
      const menu:MenuItemDB[] = await getMenu();
  
      if (user?.isLoggedIn !== true || user?.permissions.menu || menu.find(item => item.slug === "")?.custom) {
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
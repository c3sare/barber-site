import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";

const AdminPanelIndex = ({permissions={}}: any) => {

    return (
        <Layout perms={permissions}>

        </Layout>
    )
}

export default AdminPanelIndex;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true) {
        return {
          notFound: true,
        };
      }
  
      return {
        props: {
          permissions: user?.permissions,
        },
      };
    },
    sessionOptions
);
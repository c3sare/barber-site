import { Layout } from "@/componentsAdminPanel/Layout"
import { sessionOptions } from "@/lib/AuthSession/Config";
import { withIronSessionSsr } from "iron-session/next";

const AdminPanelReservations = ({permissions}: any) => {

    return (
        <Layout perms={permissions}>

        </Layout>
    )
}

export default AdminPanelReservations;

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
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
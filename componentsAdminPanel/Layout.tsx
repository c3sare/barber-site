import {Container} from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import Menu from './Menu';
import React from 'react';
import style from "../styles/admin.module.css";
import Head from 'next/head';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

interface SnackBarMessage {
    open: boolean,
    msg: string,
    type: "info" | "warning" | "error"
}

const generateClassName = createGenerateClassName({
  disableGlobal: true,
  seed: 'mui-jss',
});

export const Layout = ({children, perms} : any) => {
    const menuDiv = React.useRef<HTMLDivElement>(null);
    const [snackBar, setSnackBar] = React.useState<SnackBarMessage>({open: false, msg: '', type: "info"});

    const handleCloseSnack = () => {
        setSnackBar(state => ({open: false, msg: state.msg, type: state.type}));
    }

    return (
        <StylesProvider generateClassName={generateClassName}>
          <Head>
            <title>Panel Administracyjny</title>
          </Head>
          <header ref={menuDiv} className={style.header}>
            <Menu perms={perms}/>
          </header>
          <main className={style.main}>
          <Container component="div">
            {children}
          </Container>
          </main>
          <footer>
    
          </footer>
          <Snackbar open={snackBar.open} autoHideDuration={6000} onClose={handleCloseSnack}>
            <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnack} severity={snackBar.type} sx={{ width: '100%' }}>
              {snackBar.msg}
            </MuiAlert>
          </Snackbar>
        </StylesProvider>
      )
}
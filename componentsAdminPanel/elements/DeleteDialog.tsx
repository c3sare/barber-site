import * as React from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import DeleteIcon from '@mui/icons-material/Delete';
import CButton from "./CButton";
import CLoadingButton from "./CLoadingButton";

interface DialogState {
  open: boolean,
  id: string,
  text: string
}

export default function DeleteDialog({
  url,
  open,
  setOpen,
  setState
}:{
  url: string,
  open: {
    id: string,
    open: boolean,
    text: string
  },
  setOpen:CallableFunction,
  setState: CallableFunction
}) {
  const [loading, setLoading] = React.useState(false);
  const handleClose = () => {
    setOpen((state:DialogState) => ({
      open: false,
      id: state.id,
      text: state.text
    }
    ));
  };

  const handleDeleteElement = async () => {
    setLoading(true);
    const res:{error: boolean} = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: open.id
      })
    }).then(data => data.json());

    if(!res.error) {
      setTimeout(() => setState((prevState:any[]) => {
        return prevState.filter(item => item._id !== open.id);
      }), 250);
    } else {
      console.log("Nie udało wykonać usunięcia!")
    }
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog
      open={open.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Usuwanie</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {open.text}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <CButton disabled={loading} onClick={handleClose}>Anuluj</CButton>
        <CLoadingButton loading={loading} disabled={loading} loadingPosition="start" startIcon={<DeleteIcon/>} onClick={handleDeleteElement} autoFocus>
          Usuń
        </CLoadingButton>
      </DialogActions>
    </Dialog>
  );
}

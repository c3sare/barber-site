import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { MenuItemDB } from "@/lib/types/MenuItem";
import LoadingButton from "@mui/lab/LoadingButton";
import DeleteIcon from '@mui/icons-material/Delete';

interface DialogState {
  open: boolean,
  id: string
}

export default function DeleteDialog({
  open,
  setOpen,
  setState,
  state
}:{
  open: {
    id: string,
    open: boolean
  },
  setOpen:CallableFunction,
  setState: CallableFunction,
  state: MenuItemDB[]
}) {
  const [loading, setLoading] = React.useState(false);
  const handleClose = () => {
    setOpen((state:DialogState) => ({
      open: false,
      id: state.id,
    }
    ));
  };

  const handleDeleteElement = async () => {
    setLoading(true);
    const res:{error: boolean} = await fetch("/api/menu", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        id: open.id
      })
    }).then(data => data.json());

    if(!res.error) {
      setTimeout(() => setState((prevState:MenuItemDB[]) => {
        return prevState.filter(item => item._id !== open.id);
      }), 250);
    } else {
      console.log("Nie udało usunąć się węzła!")
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
          Czy chcesz usunąć ten węzeł nawigacji? - <b>{state.find(item => item._id === open.id)?.title || ""}</b>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={handleClose}>Anuluj</Button>
        <LoadingButton loading={loading} disabled={loading} loadingPosition="start" startIcon={<DeleteIcon/>} onClick={handleDeleteElement} autoFocus>
          Usuń
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

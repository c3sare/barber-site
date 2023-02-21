import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { MenuItemDB } from "@/lib/types/MenuItem";

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
  const handleClose = () => {
    setOpen({
      open: false,
      id: "",
    });
  };

  const handleDeleteElement = () => {
    setState((prevState:MenuItemDB[]) => {
      return prevState.filter(item => item._id !== open.id);
    });
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
        <Button onClick={handleClose}>Anuluj</Button>
        <Button onClick={handleDeleteElement} autoFocus>
          Usuń
        </Button>
      </DialogActions>
    </Dialog>
  );
}

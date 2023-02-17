import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default function DeleteDialog({ open, setOpen }:any) {
  const handleClose = () => {
    setOpen((state:any) => ({
      text: state.text,
      open: false,
      name: state.name,
      func: null,
    }));
  };

  const handleDeleteElement = () => {
    open.func();
    handleClose();
  };

  return (
    <Dialog
      open={open.open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{open.name}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {open.text}
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

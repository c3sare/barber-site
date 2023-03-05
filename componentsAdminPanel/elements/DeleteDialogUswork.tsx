import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import WorkData from '@/lib/types/WorkData';
import CButton from './CButton';
import CLoadingButton from './CLoadingButton';

export default function DeleteDialogUswork({
    state,
    setState,
    data,
    setData
}: {
    state: WorkData[],
    setState: (state:WorkData[] | any) => void,
    data: {
        open: boolean,
        id: string
    },
    setData: ({open, id}:{
        open: boolean,
        id: string
    } | any) => void
}) {
  const [loading, setLoading] = React.useState(false)

  const handleClose = () => {
    setData(({open, id}: {open: boolean, id: string}) => ({open: false, id}));
  };

  const handleDeleteItem = () => {
    setLoading(true);
    fetch("/api/uswork", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({id: data.id})
    })
    .then(res => res.json())
    .then(res => {
        if(!res.error) {
          setState((prevState:WorkData[]) => prevState.filter(item => item._id !== data.id));
        } else {
            console.log("Wystąpił błąd przy usuwaniu wpisu!");
        }
    })
    .catch(err => {
        console.log(err);
    })
    .finally(() => {
        setLoading(false);
        handleClose();
    });
  }

  return (
    <Dialog
        open={data.open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
    >
        <DialogTitle id="alert-dialog-title">
          {"Usuwanie"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Czy jesteś pewien że chcesz usunąć tę pozycję?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <CButton disabled={loading} onClick={handleClose}>Nie</CButton>
          <CLoadingButton loading={loading} disabled={loading} onClick={handleDeleteItem} autoFocus>
            Tak
          </CLoadingButton>
        </DialogActions>
    </Dialog>
  );
}
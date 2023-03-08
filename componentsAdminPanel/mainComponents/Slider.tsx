import { Box, Divider, IconButton, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import Link from "next/link";
import React from "react";
import { useState } from "react";
import CButton from "../elements/CButton";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';

interface Slide {
    _id: string,
    title: string,
    desc: string,
    image: string
}


export default function Slider() {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [data, setData] = useState({id: "", open: false});

    return (
        <>
        <h1>Cennik - Kategorie</h1>
        <Box sx={{ width: '100%', bgcolor: 'rgb(45, 45, 45)', borderRadius: "5px", overflow: "hidden", textAlign: "center"}}>
          <List sx={{padding: "0"}}>
            {slides.map(item => (
              <React.Fragment key={item._id}>
                <ListItem
                  sx={{"&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)"
                  }}}
                  secondaryAction={
                    <>
                      <Tooltip title="Usuń" placement="bottom">
                        <IconButton
                          onClick={() => setData({id: item._id, open: true})}
                          sx={{margin: "0 5px", color: "white", boxShadow: "none"}}
                        >
                          <DeleteIcon/>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ustawienia" placement="bottom">
                        <IconButton LinkComponent={Link} sx={{margin: "0 5px", color: "white", boxShadow: "none"}} href={"/admin/menuconfig/default/main/slider/"+item._id}>
                          <SettingsIcon/>
                        </IconButton>
                      </Tooltip>
                    </>
                  }
                >
                  <ListItemText primary={`${item.title}`} />
                </ListItem>
                <Divider sx={{borderColor: "#4c4c4c"}}/>
              </React.Fragment>
            ))}
          </List>
          <CButton LinkComponent={Link} href="/admin/menuconfig/default/costs/add">
            Dodaj
          </CButton>
        </Box>
        {/* <DeleteDialogCosts state={state} setState={setState} data={data} setData={setData}/> */}
        </>
    )
}
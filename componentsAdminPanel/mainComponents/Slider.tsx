import { Box, Divider, IconButton, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import Link from "next/link";
import React, { useEffect } from "react";
import { useState } from "react";
import CButton from "../elements/CButton";
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import Loading from "../Loading";
import DeleteDialog from "../elements/DeleteDialog";
import SlideData from "@/lib/types/SlideData";

export default function Slider() {
    const [loading, setLoading] = useState<boolean>(true);
    const [slides, setSlides] = useState<SlideData[]>([]);
    const [data, setData] = useState({id: "", open: false, text: ""});

    useEffect(() => {
      fetch("/api/slides")
      .then(res => res.json())
      .then(data => {
        setSlides(data);
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false));
    }, [])

    return (
        <>
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
                          onClick={() => setData({id: item._id, open: true, text: "Czy chcesz usunąć ten slajd? - "+slides.find(itemf => itemf._id === item._id)!.title})}
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
            {loading &&
              <ListItem><Loading/></ListItem>
            }
          </List>
          <CButton LinkComponent={Link} href="/admin/menuconfig#edit">
            Wróć
          </CButton>
          <CButton LinkComponent={Link} href="/admin/menuconfig/default/main/slider/add">
            Dodaj
          </CButton>
        </Box>
        <DeleteDialog setState={setSlides} open={data} setOpen={setData} url="/api/slides"/>
        </>
    )
}
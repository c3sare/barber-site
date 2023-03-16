import CButton from "@/componentsAdminPanel/elements/CButton";
import CCheckbox from "@/componentsAdminPanel/elements/CCheckBox";
import CTextField from "@/componentsAdminPanel/elements/CTextField";
import { Layout } from "@/componentsAdminPanel/Layout"
import Loading from "@/componentsAdminPanel/Loading";
import { sessionOptions } from "@/lib/AuthSession/Config";
import getData from "@/utils/getData";
import { Box, Divider, FormControl, FormControlLabel, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Select, SelectChangeEvent, Tooltip } from "@mui/material";
import { blueGrey } from "@mui/material/colors";
import { withIronSessionSsr } from "iron-session/next";
import React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import DeleteIcon from "@mui/icons-material/Delete";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteDialog from "@/componentsAdminPanel/elements/DeleteDialog";

function getTodayDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth()+1 > 9 ? date.getMonth()+1 : "0"+(date.getMonth()+1);
  const day = date.getDate() > 9 ? date.getDate() : "0"+date.getDate();

  return `${year}-${month}-${day}`
}

const AdminPanelReservations = ({permissions, workers}: any) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({open: false, id: "", text: ""});
  const [list, setList] = useState<any[]>([]);
  const [currentWorker, setCurrentWorker] = useState<string>(workers?.[0]?._id || '');
  const [currentDate, setCurrentDate] = useState<string>(getTodayDate());
  // const [showAll, setShowAll] = useState<boolean>(false);
  // const [showAllWorkers, setShowAllWorkers] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reservations/${currentWorker}/${currentDate}`)
    .then(res => res.json())
    .then(res => {
      setList(res);
    })
    .catch(err => {
      console.log(err);
      setList([]);
    })
    .finally(() => setLoading(false));
  }, [currentWorker, currentDate]);

  const handleChange = (e:SelectChangeEvent) => {
    setCurrentWorker(e.target.value);
  }
    return (
        <Layout perms={permissions}>
          <h1>Rezerwacje</h1>
          <form style={{margin: "0 auto", textAlign: "center"}}>
            <FormControl
              // disabled={showAllWorkers}
              sx={{
                margin: "8px",
                "& > label": {
                  color: blueGrey[400]
                },
                "& > div": {
                  color: blueGrey[100]
                },
                "& > div > svg": {
                  color: blueGrey[100]
                },
                "& > div > fieldset": {
                  borderColor: blueGrey[700]
                },
              }}
            >
              <InputLabel id="select-worker-label">Pracownik</InputLabel>
                <Select
                  labelId="select-worker-label"
                  id="select-worker"
                  value={currentWorker}
                  label="Pracownik"
                  onChange={handleChange}
                >
                  {workers.map((worker:any) => (
                    <MenuItem key={worker._id} value={worker._id}>{worker.name}</MenuItem>
                  ))}
                </Select>
            </FormControl>
            <CTextField
              type="date"
              name="date"
              label="Data"
              // disabled={showAll}
              value={currentDate}
              onChange={(e) => setCurrentDate(e.target.value)}
            />
            {/* <div>
              <FormControlLabel
                label="Pokaż rezerwacje wszystkich pracowników"
                control={
                  <CCheckbox
                    color="default"
                    onChange={(e) => {
                      setShowAllWorkers(e.target.checked);
                    }}
                    name="all"
                    checked={showAllWorkers}
                  />
                }
              />
              <FormControlLabel
                label="Pokaż wszystkie dla wybranego pracownika"
                control={
                  <CCheckbox
                    color="default"
                    onChange={(e) => {
                      setShowAll(e.target.checked);
                    }}
                    name="all"
                    checked={showAll}
                  />
                }
              />
            </div> */}
            <Box sx={{ width: '100%', bgcolor: 'rgb(45, 45, 45)', borderRadius: "5px", overflow: "hidden", textAlign: "center"}}>
              <List sx={{padding: "0"}}>
                {!loading && list.map(item => (
                  <React.Fragment key={item._id}>
                    <ListItem
                      sx={{"&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.1)"
                      }}}
                      secondaryAction={
                        <>
                          <Tooltip title="Usuń" placement="bottom">
                            <IconButton
                              onClick={() => setData({id: item._id, open: true, text: `Czy chcesz usunąć godzinę ${list.find(itemf => itemf._id === item._id)!.time} z dnia ${currentDate} u Pracownika - ${workers.find((item:any) => item._id === currentWorker).name}?`})}
                              sx={{margin: "0 5px", color: "white", boxShadow: "none"}}
                            >
                              <DeleteIcon/>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edytuj" placement="bottom">
                            <IconButton LinkComponent={Link} sx={{margin: "0 5px", color: "white", boxShadow: "none"}} href={"/admin/reservations/"+currentWorker+"/"+currentDate}>
                              <SettingsIcon/>
                            </IconButton>
                          </Tooltip>
                        </>
                      }
                    >
                      <ListItemText primary={`${item.time}`} />
                    </ListItem>
                    <Divider sx={{borderColor: "#4c4c4c"}}/>
                  </React.Fragment>
                ))}
                {loading &&
                  <ListItem><Loading/></ListItem>
                }
              </List>
              <CButton LinkComponent={Link} href="/admin/news/add">
                Dodaj
              </CButton>
            </Box>
          </form>
          <DeleteDialog setState={setList} open={data} setOpen={setData} url={`/api/reservations/${currentWorker}/${currentDate}`}/>
        </Layout>
    )
}

export default AdminPanelReservations;

export const getServerSideProps = withIronSessionSsr(
    async function getServerSideProps({ req }) {
      const user = req.session.user;
  
      if (user?.isLoggedIn !== true || !user?.permissions?.reservations) {
        return {
          notFound: true,
        };
      }

      const workers = await getData("barbers");
  
      return {
        props: {
          workers,
          permissions: req.session.user?.permissions,
        },
      };
    },
    sessionOptions
);
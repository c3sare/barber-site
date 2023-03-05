import { blueGrey } from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import { styled } from '@mui/material/styles';

const CTextField = styled(TextField)(({theme}) => ({
    margin: "8px",
    '& label': {
        color: blueGrey[100]
    },
    '& .Mui-error input': {
        color: 'red !important'
    },
    '& .Mui-error fieldset': {
        borderColor: 'red !important'
    },
    '& label.Mui-error': {
        borderColor: 'red !important'
    },
    '& fieldset': {
        borderColor: blueGrey[700]
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: blueGrey[500]
    },
    '& label.Mui-focused:not(.Mui-error)': {
        color: blueGrey[300]
    },
    '& input:valid:focus + .MuiOutlinedInput-notchedOutline': {
        borderColor: blueGrey[300]
    },
    '& input:valid' : {
        color: blueGrey[200]
    },
    '& label.Mui-disabled': {
        color: 'rgba(255, 255, 255, 0.25)'
    },
    '& .Mui-disabled .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.25)'
    },
    '& input.Mui-disabled': {
        WebkitTextFillColor: 'rgba(255, 255, 255, 0.25)'
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#ffffff',
    },
    "& .MuiSelect-icon": {
          color: "#ffffff"
    },
    "& .MuiInput-icon": {
          color: "#ffffff"
    },
}));

  export default CTextField;
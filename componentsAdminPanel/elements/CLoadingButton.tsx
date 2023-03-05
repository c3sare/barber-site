import LoadingButton from '@mui/lab/LoadingButton';
import { styled } from '@mui/material/styles';
import { grey, blueGrey } from '@mui/material/colors';

const CLoadingButton = styled(LoadingButton)(({theme}) => ({
    margin: "8px",
    background: `linear-gradient(${grey[700]}, ${blueGrey[700]})`,
    color: 'white',
    boxShadow: `0 0 2px ${blueGrey[300]}`,
    '&:hover': {
        boxShadow: `0 0 6px ${blueGrey[300]}`,
    }
}));

export default CLoadingButton;
import FormControlLabel from '@mui/material/FormControlLabel';
import { blueGrey } from '@mui/material/colors';
import styled from '@emotion/styled';

const CFormControlLabel = styled(FormControlLabel)({
    '&.Mui-disabled .MuiTypography-root': {
        color: 'rgba(255, 255, 255, 0.25)',
    },
    '&.Mui-disabled .MuiCheckbox-root': {
        color: 'rgba(255, 255, 255, 0.25)'
    },
    '& .MuiTypography-root': {
        color: blueGrey[500]
    },
    '& .MuiCheckbox-root': {
        color: blueGrey[500]
    }
});

export default CFormControlLabel;

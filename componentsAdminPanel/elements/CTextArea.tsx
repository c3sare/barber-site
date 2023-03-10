import styled from '@emotion/styled';
import { TextareaAutosize } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

const CTextArea = styled(TextareaAutosize)({
    backgroundColor: 'rgba(255, 255, 255, 0)',
    border: "1px solid "+blueGrey[700],
    resize: "vertical",
    borderRadius: "5px",
    width: "100%",
    minHeight: "56px",
    maxHeight: "300px",
    padding: "16.5px 14px",
    color: blueGrey[300],
    '&:focus-visible': {
        outline: "0px"
    }
});

export default CTextArea;
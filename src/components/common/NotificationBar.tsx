import {Alert, Snackbar} from "@mui/material";

interface NotificationBarProps {
    snackbar: { open: boolean, severity: "success" | "error", message: string }
    setSnackbar: (snackbar: { open: boolean, severity: "success" | "error", message: string }) => void;
}

const NotificationBar = ({snackbar, setSnackbar}: NotificationBarProps) => {
    return (
        <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({...snackbar, open: false})}
            anchorOrigin={{vertical: 'top', horizontal: 'center'}}
        >
            <Alert
                onClose={() => setSnackbar({...snackbar, open: false})}
                severity={snackbar.severity}
                sx={{width: '100%', color: 'white'}}
                variant="filled"
            >
                {snackbar.message}
            </Alert>
        </Snackbar>
    )
}

export default NotificationBar;
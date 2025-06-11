import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import DriverAuth from './components/auth/DriverAuth';
import Dashboard from './components/dashboard/Dashboard';
import './App.css';

// Create a responsive theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    components: {
        MuiContainer: {
            styleOverrides: {
                root: {
                    paddingLeft: 16,
                    paddingRight: 16,
                    '@media (min-width: 600px)': {
                        paddingLeft: 24,
                        paddingRight: 24,
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Router>
                    <Routes>
                        <Route path="/" element={<DriverAuth/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="*" element={<Navigate to="/" replace/>}/>
                    </Routes>
                </Router>
            </LocalizationProvider>
        </ThemeProvider>
    );
}

export default App

import {BrowserRouter as Router, Navigate, Route, Routes} from 'react-router-dom';
import {createTheme, CssBaseline, ThemeProvider} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import DriverAuth from './components/auth/DriverAuth';
import Dashboard from './components/dashboard/Dashboard';
import {useTranslation} from 'react-i18next';
import rtlPlugin from 'stylis-plugin-rtl';
import {CacheProvider} from '@emotion/react';
import createCache from '@emotion/cache';
import {useEffect} from 'react';
import './App.css';

// Create rtl cache
const cacheRtl = createCache({
    key: 'muirtl',
    stylisPlugins: [rtlPlugin],
});

// Create ltr cache
const cacheLtr = createCache({
    key: 'muiltr',
});

function App() {
    const {i18n} = useTranslation();
    const isRtl = i18n.language === 'ar';

    useEffect(() => {
        // Set the HTML dir attribute based on the current language
        document.dir = isRtl ? 'rtl' : 'ltr';
        document.documentElement.lang = i18n.language;
    }, [isRtl, i18n.language]);

    // Create a responsive theme
    const theme = createTheme({
        direction: isRtl ? 'rtl' : 'ltr',
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

    return (
        <CacheProvider value={isRtl ? cacheRtl : cacheLtr}>
            <ThemeProvider theme={theme}>
                <CssBaseline/>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <Router future={{v7_startTransition: true}}>
                        <Routes>
                            <Route path="/" element={<DriverAuth/>}/>
                            <Route path="/dashboard" element={<Dashboard/>}/>
                            <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </Router>
                </LocalizationProvider>
            </ThemeProvider>
        </CacheProvider>
    );
}

export default App;
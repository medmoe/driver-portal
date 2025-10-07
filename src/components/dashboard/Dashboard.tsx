import React, {useEffect, useState} from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import useAuthStore from '../../stores/useAuthStore';
import Notifications from '@mui/icons-material/Notifications';
import Assignment from '@mui/icons-material/Assignment';
import axios from "axios";
import {API} from "../../constants.ts";
import type {FormListResponse} from "../../types";
import DailyStatusFormDialog from "../dialogs/DailyStatusFormDialog.tsx";
import DailyFormsTodoList from "../common/DailyFormsTodoList.tsx";
import Header from "../common/Header.tsx";
import StatusCard from "../common/StatusCard.tsx";

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{p: 3}}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Dashboard: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {auth} = useAuthStore();
    const [tabValue, setTabValue] = useState(1); // Default to Forms tab (index 1)
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [formListResponse, setFormListResponse] = useState<FormListResponse>({
        count: '0',
        next: null,
        previous: null,
        results: []
    });
    const [openFormDialog, setOpenFormDialog] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>('');

    // Calculate total pages based on count
    const pageSize = 20; // Assuming 10 items per page
    const totalPages = Math.ceil(+formListResponse.count / pageSize);

    // fetch submitted forms
    useEffect(() => {
        const fetchSubmittedForms = async () => {
            setLoading(true);
            try {
                const options = {headers: {'Content-Type': 'application/json'}, withCredentials: true};
                const response = await axios.get(`${API}drivers/starting-shift/?page=${page}`, options);
                setFormListResponse(response.data);
            } catch (error: any) {
                if (error.response.status === 401) {
                    navigate('/');
                }
                console.error('Error fetching submitted forms:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmittedForms();
    }, [page]);

    // Update time every minute to keep due status current
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = () => {
        // In a real app, you would handle logout logic here
        navigate('/');
    };

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setPage(value);
    };

    // Check if form is past due
    const isDuePassed = () => {
        const dueDate = new Date();
        dueDate.setHours(9, 0, 0, 0); // Today 9:00 AM
        return currentTime > dueDate;
    };

    return (
        <Container component="main" maxWidth="md">
            <Paper
                elevation={3}
                sx={{
                    mt: 8,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Header onLogout={handleLogout} userName={auth.user?.firstName}/>

                <Divider sx={{mb: 2}}/>

                {/* Tab Navigation */}
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    aria-label="dashboard tabs"
                    sx={{borderBottom: 1, borderColor: 'divider'}}
                >
                    <Tab
                        icon={<Notifications/>}
                        iconPosition="start"
                        label={t('dashboard.tabs.notifications')}
                        id="tab-0"
                        aria-controls="tabpanel-0"
                    />
                    <Tab
                        icon={<Assignment/>}
                        iconPosition="start"
                        label={t('dashboard.tabs.forms')}
                        id="tab-1"
                        aria-controls="tabpanel-1"
                    />
                </Tabs>

                {/* Notifications Tab Content */}
                <TabPanel value={tabValue} index={0}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1" color="text.secondary" sx={{fontStyle: 'italic'}}>
                                {t('dashboard.notifications.noNotifications')}
                            </Typography>
                        </CardContent>
                    </Card>
                </TabPanel>

                {/* Forms Tab Content */}
                <TabPanel value={tabValue} index={1}>
                    {/* TO-DO Section */}
                    <Typography variant="h6" sx={{mb: 2}}>{t('dashboard.forms.todo')}</Typography>
                    <DailyFormsTodoList
                        formListResponse={formListResponse}
                        isDuePassed={isDuePassed}
                        setOpenFormDialog={setOpenFormDialog}
                        setSelectedDate={setSelectedDate}
                    />
                    <DailyStatusFormDialog
                        open={openFormDialog}
                        onClose={() => setOpenFormDialog(false)}
                        setFormListResponse={setFormListResponse}
                        formListResponse={formListResponse}
                        selectedDate={selectedDate}
                    />

                    <Typography variant="h6" sx={{mt: 4, mb: 2}}>{t('dashboard.forms.submittedForms')}</Typography>

                    {loading ? (
                        <Box sx={{display: 'flex', justifyContent: 'center', my: 4}}>
                            <CircularProgress/>
                        </Box>
                    ) : formListResponse.results.length > 0 ? (
                        <>
                            <Grid container spacing={2}>
                                {formListResponse.results.map((form) => <StatusCard key={form.id} form={form}/>)}
                            </Grid>

                            <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={handlePageChange}
                                    color="primary"
                                />
                            </Box>
                        </>
                    ) : (
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="body1" color="text.secondary" sx={{fontStyle: 'italic'}}>
                                    {t('dashboard.forms.noSubmittedForms')}
                                </Typography>
                            </CardContent>
                        </Card>
                    )}
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default Dashboard;
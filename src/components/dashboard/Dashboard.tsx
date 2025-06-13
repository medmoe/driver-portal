import React, {useEffect, useState} from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';

import {useNavigate} from 'react-router-dom';
import useAuthStore from '../../stores/useAuthStore';

import Notifications from '@mui/icons-material/Notifications';
import Assignment from '@mui/icons-material/Assignment';
import CheckCircle from '@mui/icons-material/CheckCircle';
import AccessTime from '@mui/icons-material/AccessTime';


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
    const navigate = useNavigate();
    const {auth} = useAuthStore();
    const [tabValue, setTabValue] = useState(1); // Default to Forms tab (index 1)
    const [currentTime, setCurrentTime] = useState(new Date());

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
                {/* Header with greeting and logout button */}
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
                    <Typography variant="h5">
                        Hi, {auth.user?.firstName}!
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogout}
                        size="small"
                    >
                        Logout
                    </Button>
                </Box>

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
                        label="Notifications"
                        id="tab-0"
                        aria-controls="tabpanel-0"
                    />
                    <Tab
                        icon={<Assignment/>}
                        iconPosition="start"
                        label="Forms"
                        id="tab-1"
                        aria-controls="tabpanel-1"
                    />
                </Tabs>

                {/* Notifications Tab Content */}
                <TabPanel value={tabValue} index={0}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="body1" color="text.secondary" sx={{fontStyle: 'italic'}}>
                                No new notifications at this time. System alerts will appear here.
                            </Typography>
                        </CardContent>
                    </Card>
                </TabPanel>

                {/* Forms Tab Content */}
                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" sx={{mb: 2}}>TO-DO:</Typography>
                    <List>
                        <ListItem
                            component={'button'}
                            sx={{
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                borderRadius: 1,
                                mb: 2
                            }}
                        >
                            <ListItemIcon>
                                <CheckCircle color="success"/>
                            </ListItemIcon>
                            <ListItemText
                                primary="Daily Status Form"
                                secondary={
                                    isDuePassed()
                                        ? "Due: Today 9:00 AM (Late)"
                                        : "Due: Today 9:00 AM"
                                }
                                slotProps={{
                                    primary: {
                                        fontWeight: 'medium'
                                    },
                                    secondary: {
                                        color: isDuePassed() ? 'error' : 'text.secondary'
                                    }
                                }}
                            />
                        </ListItem>
                    </List>

                    <Typography variant="h6" sx={{mt: 4, mb: 2}}>COMPLETED:</Typography>
                    <List>
                        <ListItem
                            sx={{
                                border: '1px solid rgba(0, 0, 0, 0.12)',
                                borderRadius: 1
                            }}
                        >
                            <ListItemIcon>
                                <AccessTime/>
                            </ListItemIcon>
                            <ListItemText
                                primary="06/10/24 - Submitted at 8:30 AM"
                                slotProps={{
                                    secondary: {
                                        color: 'text.secondary'
                                    }
                                }}
                            />
                        </ListItem>
                    </List>
                </TabPanel>
            </Paper>
        </Container>
    );
};

export default Dashboard;

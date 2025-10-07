import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBack from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import {API} from '../../constants';
import type {FormData} from '../../types';
import {format} from 'date-fns';
import {useTranslation} from 'react-i18next';
import useAuthStore from "../../stores/useAuthStore";
import Header from "../common/Header.tsx";

const ViewDailyStatus: React.FC = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormData | null>(null);
    const {auth} = useAuthStore();
    useEffect(() => {
        const fetchForm = async () => {
            try {
                const options = {headers: {'Content-Type': 'application/json'}, withCredentials: true};
                const response = await axios.get(`${API}drivers/starting-shift/${id}/`, options);
                setForm(response.data);
            } catch (e) {
                // On error, go back to dashboard
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        if (id) void fetchForm();
    }, [id, navigate]);

    if (loading) {
        return (
            <Container component="main" maxWidth="sm">
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}>
                    <CircularProgress/>
                </Box>
            </Container>
        );
    }


    if (!form) return null;

    const handleLogout = async () => {
        navigate('/')
    }

    return (
        <Container component="main" maxWidth="md">
            <Paper elevation={3} sx={{mt: 8, p: 3, display: 'flex', flexDirection: 'column'}}>
                <Header onLogout={handleLogout} userName={auth.user?.firstName}/>
                <Divider sx={{mb: 2}}/>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 2, gap: 1}}>
                    <Button startIcon={<ArrowBack/>} onClick={() => navigate(-1)}>{t('common.back') || 'Back'}</Button>
                    <Typography variant="h6" sx={{ml: 'auto'}}>
                        {t('dashboard.forms.formCard.viewButton')}
                    </Typography>
                </Box>
                <Divider sx={{mb: 2}}/>

                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography color="text.secondary">{t('dashboard.forms.formCard.status')}</Typography>
                    <Typography>{form.status ? t('dashboard.forms.formCard.active') : t('dashboard.forms.formCard.absent')}</Typography>
                </Box>

                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography color="text.secondary">{t('dashboard.forms.formCard.load')}</Typography>
                    <Typography>{form.load ? Number(form.load).toLocaleString() : '-'} {t('dashboard.forms.formCard.loadUnit')}</Typography>
                </Box>

                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography color="text.secondary">{t('dashboard.forms.formCard.mileage')}</Typography>
                    <Typography>{form.mileage ? Number(form.mileage).toLocaleString() : '-'} {t('dashboard.forms.formCard.mileageUnit')}</Typography>
                </Box>

                <Divider sx={{my: 2}}/>

                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography color="text.secondary">{t('dialog.dailyStatusForm.date')}</Typography>
                    <Typography>{form.date ? format(new Date(form.date), 'MMM d, yyyy') : '-'}</Typography>
                </Box>
                <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                    <Typography color="text.secondary">{t('dialog.dailyStatusForm.time')}</Typography>
                    <Typography>{form.time}</Typography>
                </Box>

                <Divider sx={{my: 2}}/>

                <Typography variant="subtitle1" sx={{mb: 1}}>{t('dialog.dailyStatusForm.deliveryAreas.title')}</Typography>
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2}}>
                    {form.delivery_areas?.length ? form.delivery_areas.map((a, i) => (
                        <Chip key={`${a}-${i}`} label={a} color="primary" variant="outlined"/>
                    )) : (
                        <Typography color="text.secondary">-</Typography>
                    )}
                </Box>

                {!form.status && (
                    <>
                        <Divider sx={{my: 2}}/>
                        <Typography variant="subtitle1" sx={{mb: 1}}>{t('dialog.dailyStatusForm.absenceReason.title')}</Typography>
                        <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                            <Typography color="text.secondary">{t('dialog.dailyStatusForm.absenceReason.reason')}</Typography>
                            <Typography>{form.absence_type || '-'}</Typography>
                        </Box>
                        {form.absence_type === 'OTHER' && (
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 1}}>
                                <Typography color="text.secondary">{t('dialog.dailyStatusForm.absenceReason.otherReason')}</Typography>
                                <Typography>{form.otherReason || '-'}</Typography>
                            </Box>
                        )}
                    </>
                )}

                <Divider sx={{my: 2}}/>
                <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                    <Button variant="outlined" onClick={() => navigate('/dashboard')}>{t('common.cancel') || 'Close'}</Button>
                    <Button variant="contained" onClick={() => navigate(`/daily-status/edit/${form.id}`)}>{t('dashboard.forms.formCard.editButton')}</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default ViewDailyStatus;

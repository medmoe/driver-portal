import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBack from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import {API} from '../../constants';
import type {AbsenceType, FormData} from '../../types';
import {useTranslation} from 'react-i18next';
import useAuthStore from "../../stores/useAuthStore";
import Header from "../common/Header.tsx";

const EditDailyStatus: React.FC = () => {
    const {t} = useTranslation();
    const {auth} = useAuthStore();
    const navigate = useNavigate();
    const {id} = useParams<{ id: string }>();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deliveryAreaInput, setDeliveryAreaInput] = useState('');
    const [formData, setFormData] = useState<FormData | null>(null);
    const originalFormDataRef = useRef<FormData | null>(null);
    const [errors, setErrors] = useState<{ load?: string; mileage?: string; absence_type?: string; otherReason?: string; deliveryAreas?: string }>({});


    useEffect(() => {
        const fetchForm = async () => {
            setLoading(true);
            try {
                const options = {headers: {'Content-Type': 'application/json'}, withCredentials: true};
                const response = await axios.get(`${API}drivers/starting-shift/${id}/`, options);
                // Normalize booleans to string as used in dialog
                const f = response.data as FormData;
                setFormData(f);
                // Store the original data for potential restoration
                originalFormDataRef.current = f;
            } catch (e) {
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        if (id) void fetchForm();
    }, [id, navigate]);

    const validate = useCallback(() => {
        if (!formData) return false;
        const e: typeof errors = {};
        if (formData.status) {
            if (!formData.load || !/^\d+$/.test(formData.load)) e.load = t('dialog.dailyStatusForm.vehicleStatistics.loadError');
            if (!formData.mileage || !/^\d+$/.test(formData.mileage)) e.mileage = t('dialog.dailyStatusForm.vehicleStatistics.mileageError');
            if (!formData.delivery_areas || formData.delivery_areas.length === 0) e.deliveryAreas = t('dialog.dailyStatusForm.deliveryAreas.placeholder');
        } else {

            if (!formData.absence_type) e.absence_type = t('dialog.dailyStatusForm.absenceReason.reasonRequired');
            if (formData.absence_type === 'OTHER' && !formData.otherReason) e.otherReason = t('dialog.dailyStatusForm.absenceReason.otherReasonRequired');
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    }, [formData, t]);

    const handleSave = async () => {
        if (!formData) return;
        if (!validate()) return;
        setSaving(true);
        try {
            const options = {headers: {'Content-Type': 'application/json'}, withCredentials: true};
            await axios.put(`${API}drivers/starting-shift/${id}/`, formData, options);
            navigate(`/daily-status/view/${id}`);
        } catch (e) {
            // Keep user on page, maybe show error later
        } finally {
            setSaving(false);
        }
    };

    if (loading || !formData) {
        return (
            <Container component="main" maxWidth="sm">
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 10}}>
                    <CircularProgress/>
                </Box>
            </Container>
        );
    }

    const readOnly = !formData.status;
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
                        {t('dashboard.forms.formCard.editButton')}
                    </Typography>
                </Box>
                <Divider sx={{mb: 2}}/>

                {/* Driver Status */}
                <FormControl component="fieldset" sx={{mb: 3, width: '100%'}}>
                    <FormLabel component="legend">{t('dialog.dailyStatusForm.driverStatus.title')}</FormLabel>
                    <RadioGroup
                        value={formData.status}
                        onChange={(e) => {
                            const newStatus = e.target.value;
                            const prevStatus = formData.status;

                            setFormData((prev) => {
                                if (!prev) return prev;

                                if (newStatus === 'false') {
                                    return {
                                        ...prev,
                                        status: false,
                                        load: '',
                                        mileage: '',
                                        delivery_areas: []
                                    };
                                } else if (!prevStatus && newStatus === 'true' && originalFormDataRef.current) {
                                    // Switching back to active status - restore original values if available
                                    return {
                                        ...prev,
                                        status: true,
                                        load: originalFormDataRef.current.load,
                                        mileage: originalFormDataRef.current.mileage,
                                        delivery_areas: originalFormDataRef.current.delivery_areas
                                    }
                                } else {
                                    // Just update status in other cases
                                    return {
                                        ...prev,
                                        status: newStatus === 'true',
                                    }
                                }
                            })
                        }}
                    >
                        <FormControlLabel value="true" control={<Radio/>} label={t('dialog.dailyStatusForm.driverStatus.active')}/>
                        <FormControlLabel value="false" control={<Radio/>} label={t('dialog.dailyStatusForm.driverStatus.absent')}/>
                    </RadioGroup>
                </FormControl>

                {/* Vehicle statistics */}
                <FormControl component="fieldset" sx={{mb: 3, width: '100%'}}>
                    <FormLabel component="legend">{t('dialog.dailyStatusForm.vehicleStatistics.title')}</FormLabel>
                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 2, mt: 1}}>
                        <TextField
                            required={!readOnly}
                            fullWidth
                            label={t('dialog.dailyStatusForm.vehicleStatistics.load')}
                            type="number"
                            slotProps={{input: {inputProps: {min: 0}, readOnly}}}
                            value={formData.load ?? ''}
                            onChange={(e) => setFormData((p) => (p ? {...p, load: e.target.value} : p))}
                            error={!readOnly && !!errors.load}
                            helperText={!readOnly ? errors.load : undefined}
                        />
                        <TextField
                            required={!readOnly}
                            fullWidth
                            label={t('dialog.dailyStatusForm.vehicleStatistics.mileage')}
                            type="number"
                            slotProps={{input: {inputProps: {min: 0}, readOnly}}}
                            value={formData.mileage ?? ''}
                            onChange={(e) => setFormData((p) => (p ? {...p, mileage: e.target.value} : p))}
                            error={!readOnly && !!errors.mileage}
                            helperText={!readOnly ? errors.mileage : undefined}
                        />
                    </Box>
                </FormControl>

                {/* Delivery Areas */}
                <FormControl component="fieldset" sx={{mb: 3, width: '100%'}} error={!!errors.deliveryAreas}>
                    <FormLabel component="legend" sx={{mb: 1}}>{t('dialog.dailyStatusForm.deliveryAreas.title')}</FormLabel>
                    <Box>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                            <TextField
                                fullWidth
                                label={t('dialog.dailyStatusForm.deliveryAreas.addDeliveryArea')}
                                value={deliveryAreaInput}
                                placeholder={t('dialog.dailyStatusForm.deliveryAreas.placeholder')}
                                onChange={(e) => setDeliveryAreaInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (deliveryAreaInput.trim()) {
                                            setFormData((p) => (p ? {...p, delivery_areas: [...(p.delivery_areas || []), deliveryAreaInput.trim()]} : p));
                                            setDeliveryAreaInput('');
                                        }
                                    }
                                }}
                                error={!readOnly && !!errors.deliveryAreas}
                                helperText={!readOnly ? errors.deliveryAreas : undefined}
                                required={!readOnly}
                                slotProps={{input: {readOnly}}}
                            />
                            <Button
                                variant="contained"
                                sx={{ml: 1, minWidth: '40px', height: '40px', visibility: readOnly ? 'hidden' : 'visible'}}
                                onClick={() => {
                                    if (deliveryAreaInput.trim()) {
                                        setFormData((p) => (p ? {...p, delivery_areas: [...(p.delivery_areas || []), deliveryAreaInput.trim()]} : p));
                                        setDeliveryAreaInput('');
                                    }
                                }}
                            >
                                {t('dialog.dailyStatusForm.deliveryAreas.addButton')}
                            </Button>
                        </Box>
                        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2}}>
                            {formData.delivery_areas?.map((area, i) => (
                                <Chip
                                    key={`${area}-${i}`}
                                    label={area}
                                    onDelete={readOnly ? undefined : () => setFormData((p) => (p ? {...p, delivery_areas: (p.delivery_areas || []).filter((a) => a !== area)} : p))}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Box>
                    </Box>
                </FormControl>

                {/* Absence Reason */}
                {!formData.status && (
                    <Box sx={{mb: 3}}>
                        <FormControl component="fieldset" fullWidth sx={{mb: 2}}>
                            <FormLabel component="legend">{t('dialog.dailyStatusForm.absenceReason.title')}</FormLabel>
                            <Select
                                value={formData.absence_type}
                                onChange={(e) => setFormData((p) => (p ? {...p, absence_type: e.target.value as AbsenceType} : p))}
                                displayEmpty
                                error={!!errors.absence_type}
                            >
                                <MenuItem value={'MAINTENANCE'}>{t('dialog.dailyStatusForm.absenceReason.maintenance')}</MenuItem>
                                <MenuItem value={'SICKNESS'}>{t('dialog.dailyStatusForm.absenceReason.sickness')}</MenuItem>
                                <MenuItem value={'OTHER'}>{t('dialog.dailyStatusForm.absenceReason.other')}</MenuItem>
                            </Select>
                        </FormControl>
                        {formData.absence_type === 'OTHER' && (
                            <TextField
                                fullWidth
                                label={t('dialog.dailyStatusForm.absenceReason.otherReason')}
                                value={formData.otherReason || ''}
                                onChange={(e) => setFormData((p) => (p ? {...p, otherReason: e.target.value} : p))}
                                error={!!errors.otherReason}
                                helperText={errors.otherReason}
                            />
                        )}
                    </Box>
                )}

                <Divider sx={{my: 2}}/>
                <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
                    <Button variant="outlined" onClick={() => navigate(`/daily-status/view/${id}`)}>{t('common.cancel') || 'Cancel'}</Button>
                    <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? t('common.saving') || 'Saving…' : (t('common.save') || 'Save')}</Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default EditDailyStatus;

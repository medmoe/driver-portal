import React, {useCallback, useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from "@mui/material/RadioGroup";
import Select, {type SelectChangeEvent} from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import axios from "axios";
import {API} from "../../constants.ts";
import {format} from 'date-fns';
import NotificationBar from "../common/NotificationBar.tsx";
import {type AbsenceType, type FormData, type FormListResponse} from "../../types.ts";
import {useTranslation} from 'react-i18next';

interface DailyStatusFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
    setFormListResponse: (formData: FormListResponse) => void
    formListResponse: FormListResponse
    selectedDate: string
}

const DailyStatusFormDialog: React.FC<DailyStatusFormDialogProps> = ({
                                                                         open,
                                                                         onClose,
                                                                         onSubmitSuccess,
                                                                         setFormListResponse,
                                                                         formListResponse,
                                                                         selectedDate,
                                                                     }: DailyStatusFormDialogProps) => {
    const {t} = useTranslation();
    const [submitting, setSubmitting] = useState(false);
    const [deliveryArea, setDeliveryArea] = useState<string>('');
    const [readOnly, setReadOnly] = useState<boolean>(false);
    const [snackBar, setSnackBar] = useState<{
        open: boolean;
        severity: "success" | "error";
        message: string
    }>({
        open: false,
        severity: "success",
        message: ""
    });

    // Form state
    const [formData, setFormData] = useState<FormData>({
        date: selectedDate,
        time: format(new Date(), 'HH:mm:ss'),
        delivery_areas: [],
        status: true, // false: absent, ture: present
        absence_type: "MAINTENANCE",
        otherReason: '',
        load: '',
        mileage: '',
    });

    // Form validation
    const [errors, setErrors] = useState<{
        delivery_areas?: string;
        absence_type?: string;
        otherReason?: string;
        load?: string;
        mileage?: string;
    }>({});

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            // Set current time when dialog opens
            const now = new Date();

            // Load draft from localStorage
            const savedDraft = localStorage.getItem('dailyStatusFormDraft');
            if (savedDraft) {
                try {
                    const parsedDraft = JSON.parse(savedDraft);
                    const date = format(now, 'yyyy-MM-dd');
                    // Update only if the draft is from today
                    if (parsedDraft.date === date) {
                        setFormData(parsedDraft);
                    } else {
                        // Reset form if draft is not from today
                        setFormData({
                            date: selectedDate,
                            time: format(now, 'HH:mm:ss'),
                            delivery_areas: [],
                            status: true,
                            absence_type: "MAINTENANCE",
                            otherReason: '',
                            load: '',
                            mileage: '',
                        });
                    }
                } catch (error) {
                    console.error('Error parsing saved draft:', error);
                }
            } else {
                // If no draft, set the current date and time
                setFormData(prevState => ({
                    ...prevState,
                    date: selectedDate,
                    time: format(now, 'HH:mm:ss')
                }));
            }
        }
    }, [open, selectedDate]);

    // Auto-save draft to localStorage every 30 seconds
    useEffect(() => {
        const autoSaveTimer = setInterval(() => {
            localStorage.setItem('dailyStatusFormDraft', JSON.stringify(formData));
        }, 30000);

        return () => clearInterval(autoSaveTimer);
    }, [formData]);

    // Handle form validation
    const validateForm = useCallback(() => {
        const newErrors: {
            delivery_areas?: string;
            absence_type?: string;
            otherReason?: string;
            load?: string;
            mileage?: string;
        } = {};

        if (!formData.status) {
            if (!formData.absence_type) {
                newErrors.absence_type = t('dialog.dailyStatusForm.absenceReason.reasonRequired');
            }

            if (formData.absence_type === 'OTHER' && !formData.otherReason.trim()) {
                newErrors.otherReason = t('dialog.dailyStatusForm.absenceReason.otherReasonRequired');
            }
            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        }
        if (!formData.load || !/^\d+$/.test(formData.load)) {
            newErrors.load = t('dialog.dailyStatusForm.vehicleStatistics.loadError');
        }
        if (!formData.mileage || !/^\d+$/.test(formData.mileage)) {
            newErrors.mileage = t('dialog.dailyStatusForm.vehicleStatistics.mileageError');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, t]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitting(true);

        try {
            const options = {headers: {'Content-Type': 'application/json'}, withCredentials: true};
            const response = await axios.post(`${API}drivers/starting-shift/`, formData, options);
            const {count, results, ...rest} = formListResponse;
            setFormListResponse({...rest, count: `${+count + 1}`, results: [response.data, ...results]});
            localStorage.removeItem('dailyStatusFormDraft');
            setSnackBar({open: true, severity: "success", message: t('dialog.dailyStatusForm.notifications.success')});

            // Call the onSubmitSuccess callback if provided
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }

            // Close the dialog after successful submission
            setTimeout(() => {
                onClose();
            }, 1000);
        } catch (error: any) {
            if (error.response?.status === 401) {
                setSnackBar({open: true, severity: "error", message: t('dialog.dailyStatusForm.notifications.loginError')});
            } else {
                console.error('Error submitting form:', error);
                setSnackBar({open: true, severity: "error", message: t('dialog.dailyStatusForm.notifications.submitError')});
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle radio button changes for driver status
    const handleDriverStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isAbsent = e.target.value === 'false';

        setFormData(prev => ({
            ...prev,
            status: isAbsent,
            load: isAbsent ? "" : prev.load,
            mileage: isAbsent ? "" : prev.mileage,
        }));
        setReadOnly(isAbsent);
    };

    // Handle dropdown changes for absence reason
    const handleAbsenceReasonChange = (e: SelectChangeEvent) => {
        const value = e.target.value as AbsenceType;
        setFormData(prev => ({
            ...prev,
            absence_type: value,
            otherReason: value !== 'OTHER' ? '' : prev.otherReason
        }));
    };

    // Handle text input changes for other reason
    const handleOtherReasonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            otherReason: e.target.value
        }));
    };
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle align="center">{t('dialog.dailyStatusForm.title')}</DialogTitle>

            <DialogContent>
                <Box component="form" noValidate sx={{mt: 2}}>
                    {/* Date and Time Fields */}
                    <Box sx={{display: 'flex', gap: 2, mb: 3}}>
                        <TextField
                            fullWidth
                            label={t('dialog.dailyStatusForm.date')}
                            value={formData.date}
                            slotProps={{
                                input: {
                                    readOnly: true
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label={t('dialog.dailyStatusForm.time')}
                            value={formData.time}
                            slotProps={{
                                input: {
                                    readOnly: true
                                }
                            }}
                        />
                    </Box>

                    {/* Vehicle Statistics Section */}
                    <FormControl component="fieldset" sx={{mb: 3, width: '100%'}}>
                        <FormLabel component="legend">{t('dialog.dailyStatusForm.vehicleStatistics.title')}</FormLabel>
                        <Box sx={{display: 'flex', gap: 2, mt: 1}}>
                            <TextField
                                required={!readOnly}
                                fullWidth
                                label={t('dialog.dailyStatusForm.vehicleStatistics.load')}
                                type="number"
                                slotProps={{
                                    input: {
                                        inputProps: {
                                            min: 0
                                        },
                                        readOnly: readOnly
                                    }
                                }}
                                value={formData.load}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    load: e.target.value
                                }))}
                                error={!readOnly && !!errors.load}
                                helperText={!readOnly ? errors.load : undefined}
                            />
                            <TextField
                                required={!readOnly}
                                fullWidth
                                label={t('dialog.dailyStatusForm.vehicleStatistics.mileage')}
                                type="number"
                                slotProps={{
                                    input: {
                                        inputProps: {
                                            min: 0
                                        },
                                        readOnly: readOnly
                                    }
                                }}
                                value={formData.mileage}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mileage: e.target.value
                                }))}
                                error={!readOnly && !!errors.mileage}
                                helperText={!readOnly ? errors.mileage : undefined}
                            />
                        </Box>
                    </FormControl>

                    {/* Delivery Areas Section */}
                    <FormControl
                        component="fieldset"
                        sx={{mb: 3, width: '100%'}}
                        error={!!errors.delivery_areas}
                    >
                        <FormLabel component="legend" sx={{mb: 2}}>{t('dialog.dailyStatusForm.deliveryAreas.title')}</FormLabel>
                        <Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <TextField
                                    fullWidth
                                    label={t('dialog.dailyStatusForm.deliveryAreas.addDeliveryArea')}
                                    value={deliveryArea}
                                    placeholder={t('dialog.dailyStatusForm.deliveryAreas.placeholder')}
                                    onChange={(e) => setDeliveryArea(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Prevent form submission
                                            if (deliveryArea.trim()) {
                                                setFormData(prevState => ({
                                                    ...prevState,
                                                    delivery_areas: [...prevState.delivery_areas, deliveryArea.trim()]
                                                }));
                                                setDeliveryArea('');
                                            }
                                        }
                                    }}
                                    error={!readOnly && !!errors.delivery_areas}
                                    helperText={!readOnly ? errors.delivery_areas : undefined}
                                    required={!readOnly}
                                    slotProps={{
                                        input: {
                                            readOnly: readOnly
                                        }
                                    }}
                                />
                                <Button
                                    variant={'contained'}
                                    sx={{ml: 1, minWidth: '40px', height: '40px', visibility: readOnly ? 'hidden' : 'visible'}}
                                    onClick={() => {
                                        if (deliveryArea.trim()) {
                                            setFormData(prevState => ({
                                                ...prevState,
                                                delivery_areas: [...prevState.delivery_areas, deliveryArea.trim()]
                                            }));
                                            setDeliveryArea('');
                                        }
                                    }}

                                >
                                    {t('dialog.dailyStatusForm.deliveryAreas.addButton')}
                                </Button>
                            </Box>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2}}>
                                {formData.delivery_areas.map((area, idx) => (
                                    <Chip
                                        key={idx}
                                        label={area}
                                        onDelete={() => {
                                            setFormData(prevState => ({
                                                ...prevState,
                                                delivery_areas: prevState.delivery_areas.filter(a => a !== area)
                                            }));
                                        }}
                                        color={'primary'}
                                        variant={'outlined'}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </FormControl>

                    {/* Driver Status Section */}
                    <FormControl component="fieldset" sx={{mb: 3, width: '100%'}}>
                        <FormLabel component="legend">{t('dialog.dailyStatusForm.driverStatus.title')}</FormLabel>
                        <RadioGroup
                            value={formData.status}
                            onChange={handleDriverStatusChange}
                        >
                            <FormControlLabel
                                value="true"
                                control={<Radio/>}
                                label={t('dialog.dailyStatusForm.driverStatus.active')}
                            />
                            <FormControlLabel
                                value="false"
                                control={<Radio/>}
                                label={t('dialog.dailyStatusForm.driverStatus.absent')}
                            />
                        </RadioGroup>
                    </FormControl>

                    {/* Absence Reason Section - Only shown if driver is absent */}
                    {!formData.status && (
                        <Box sx={{mb: 3}}>
                            <FormControl
                                fullWidth
                                error={!!errors.absence_type}
                                sx={{mb: errors.absence_type ? 0 : 2}}
                            >
                                <FormLabel component="legend">{t('dialog.dailyStatusForm.absenceReason.title')}</FormLabel>
                                <Select
                                    value={formData.absence_type}
                                    onChange={handleAbsenceReasonChange}
                                    displayEmpty
                                >
                                    <MenuItem value="MAINTENANCE">{t('dialog.dailyStatusForm.absenceReason.maintenance')}</MenuItem>
                                    <MenuItem value="SICKNESS">{t('dialog.dailyStatusForm.absenceReason.sickness')}</MenuItem>
                                    <MenuItem value="OTHER">{t('dialog.dailyStatusForm.absenceReason.other')}</MenuItem>
                                </Select>
                                {errors.absence_type && (
                                    <FormHelperText>{errors.absence_type}</FormHelperText>
                                )}
                            </FormControl>

                            {/* Other Reason Text Field - Only shown if "Other" is selected */}
                            {formData.absence_type === 'OTHER' && (
                                <TextField
                                    fullWidth
                                    label={t('dialog.dailyStatusForm.absenceReason.pleaseSpecify')}
                                    value={formData.otherReason}
                                    onChange={handleOtherReasonChange}
                                    error={!!errors.otherReason}
                                    helperText={errors.otherReason}
                                    required
                                />
                            )}
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{px: 3, pb: 3}}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    disabled={submitting}
                >
                    {t('dialog.dailyStatusForm.buttons.cancel')}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20}/> : null}
                    onClick={handleSubmit}
                >
                    {submitting ? t('dialog.dailyStatusForm.buttons.submitting') : t('dialog.dailyStatusForm.buttons.submit')}
                </Button>
            </DialogActions>

            <NotificationBar snackbar={snackBar} setSnackbar={setSnackBar}/>
        </Dialog>
    );
};

export default DailyStatusFormDialog;
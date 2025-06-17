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
import {type FormData, type FormListResponse} from "../../types.ts";

interface DailyStatusFormDialogProps {
    open: boolean;
    onClose: () => void;
    onSubmitSuccess?: () => void;
    setFormListResponse: (formData: FormListResponse) => void
    formListResponse: FormListResponse
}

const DailyStatusFormDialog: React.FC<DailyStatusFormDialogProps> = ({
                                                                         open,
                                                                         onClose,
                                                                         onSubmitSuccess,
                                                                         setFormListResponse,
                                                                         formListResponse,
                                                                     }: DailyStatusFormDialogProps) => {
    const [submitting, setSubmitting] = useState(false);
    const [deliveryArea, setDeliveryArea] = useState<string>('');
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
        date: format(new Date(), 'yyyy-MM-dd'),
        time: format(new Date(), 'HH:mm:ss'),
        deliveryAreas: [],
        status: "true",
        absenceReason: 'Maintenance',
        otherReason: '',
        load: '',
        mileage: ''
    });

    // Form validation
    const [errors, setErrors] = useState<{
        deliveryAreas?: string;
        absenceReason?: string;
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
                            date: format(now, 'yyyy-MM-dd'),
                            time: format(now, 'HH:mm:ss'),
                            deliveryAreas: [],
                            status: "true",
                            absenceReason: 'Maintenance',
                            otherReason: '',
                            load: '',
                            mileage: ''
                        });
                    }
                } catch (error) {
                    console.error('Error parsing saved draft:', error);
                }
            } else {
                // If no draft, set the current date and time
                setFormData(prevState => ({
                    ...prevState,
                    date: format(now, 'yyyy-MM-dd'),
                    time: format(now, 'HH:mm:ss')
                }));
            }
        }
    }, [open]);

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
            deliveryAreas?: string;
            absenceReason?: string;
            otherReason?: string;
            load?: string;
            mileage?: string;
        } = {};

        if (formData.status === "false") {
            if (!formData.absenceReason) {
                newErrors.absenceReason = 'Please select a reason for absence';
            }

            if (formData.absenceReason === 'Other' && !formData.otherReason.trim()) {
                newErrors.otherReason = 'Please specify the reason';
            }
        }
        if (!formData.load || !/^\d+$/.test(formData.load)) {
            newErrors.load = 'Please enter a valid load';
        }
        if (!formData.mileage || !/^\d+$/.test(formData.mileage)) {
            newErrors.mileage = 'Please enter a valid mileage';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

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
            setFormListResponse({...rest, count: `${+count + 1}`, results: [...results, response.data]});
            localStorage.removeItem('dailyStatusFormDraft');
            setSnackBar({open: true, severity: "success", message: "Daily status form submitted successfully"});

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
                setSnackBar({open: true, severity: "error", message: "You are not logged in. Please log in to submit the form."});
            } else {
                console.error('Error submitting form:', error);
                setSnackBar({open: true, severity: "error", message: "Failed to submit form. Please try again."});
            }
        } finally {
            setSubmitting(false);
        }
    };

    // Handle radio button changes for driver status
    const handleDriverStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            status: e.target.value
        }));
    };

    // Handle dropdown changes for absence reason
    const handleAbsenceReasonChange = (e: SelectChangeEvent) => {
        setFormData(prev => ({
            ...prev,
            absenceReason: e.target.value,
            otherReason: e.target.value !== 'Other' ? '' : prev.otherReason
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
            <DialogTitle align="center">Daily Status Form</DialogTitle>

            <DialogContent>
                <Box component="form" noValidate sx={{mt: 2}}>
                    {/* Date and Time Fields */}
                    <Box sx={{display: 'flex', gap: 2, mb: 3}}>
                        <TextField
                            fullWidth
                            label="Date"
                            value={formData.date}
                            slotProps={{
                                input: {
                                    readOnly: true
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Time"
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
                        <FormLabel component="legend">🚚 Vehicle Statistics</FormLabel>
                        <Box sx={{display: 'flex', gap: 2, mt: 1}}>
                            <TextField
                                required
                                fullWidth
                                label="Load (kg)"
                                type="number"
                                slotProps={{
                                    input: {
                                        inputProps: {
                                            min: 0
                                        }
                                    }
                                }}
                                value={formData.load || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    load: e.target.value
                                }))}
                                error={!!errors.load}
                                helperText={errors.load}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Mileage (km)"
                                type="number"
                                slotProps={{
                                    input: {
                                        inputProps: {
                                            min: 0
                                        }
                                    }
                                }}
                                value={formData.mileage || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mileage: e.target.value
                                }))}
                                error={!!errors.mileage}
                                helperText={errors.mileage}
                            />
                        </Box>
                    </FormControl>

                    {/* Delivery Areas Section */}
                    <FormControl
                        component="fieldset"
                        sx={{mb: 3, width: '100%'}}
                        error={!!errors.deliveryAreas}
                    >
                        <FormLabel component="legend" sx={{mb: 2}}>📍 Delivery Areas Covered</FormLabel>
                        <Box>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                                <TextField
                                    fullWidth
                                    label={"Add delivery area"}
                                    value={deliveryArea}
                                    placeholder="Type and press Enter to add delivery area"
                                    onChange={(e) => setDeliveryArea(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault(); // Prevent form submission
                                            if (deliveryArea.trim()) {
                                                setFormData(prevState => ({
                                                    ...prevState,
                                                    deliveryAreas: [...prevState.deliveryAreas, deliveryArea.trim()]
                                                }));
                                                setDeliveryArea('');
                                            }
                                        }
                                    }}
                                    error={!!errors.deliveryAreas}
                                    helperText={errors.deliveryAreas}
                                    required
                                />
                                <Button
                                    variant={'contained'}
                                    sx={{ml: 1, minWidth: '40px', height: '40px'}}
                                    onClick={() => {
                                        if (deliveryArea.trim()) {
                                            setFormData(prevState => ({
                                                ...prevState,
                                                deliveryAreas: [...prevState.deliveryAreas, deliveryArea.trim()]
                                            }));
                                            setDeliveryArea('');
                                        }
                                    }}
                                >Add</Button>
                            </Box>
                            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2}}>
                                {formData.deliveryAreas.map((area, idx) => (
                                    <Chip
                                        key={idx}
                                        label={area}
                                        onDelete={() => {
                                            setFormData(prevState => ({
                                                ...prevState,
                                                deliveryAreas: prevState.deliveryAreas.filter(a => a !== area)
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
                        <FormLabel component="legend">🚦 Driver Status</FormLabel>
                        <RadioGroup
                            value={formData.status}
                            onChange={handleDriverStatusChange}
                        >
                            <FormControlLabel
                                value="true"
                                control={<Radio/>}
                                label="Active"
                            />
                            <FormControlLabel
                                value="false"
                                control={<Radio/>}
                                label="Absent"
                            />
                        </RadioGroup>
                    </FormControl>

                    {/* Absence Reason Section - Only shown if driver is absent */}
                    {formData.status === "false" && (
                        <Box sx={{mb: 3}}>
                            <FormControl
                                fullWidth
                                error={!!errors.absenceReason}
                                sx={{mb: errors.absenceReason ? 0 : 2}}
                            >
                                <FormLabel component="legend">Reason for Absence</FormLabel>
                                <Select
                                    value={formData.absenceReason}
                                    onChange={handleAbsenceReasonChange}
                                    displayEmpty
                                >
                                    <MenuItem value="Maintenance">Maintenance</MenuItem>
                                    <MenuItem value="Sickness">Sickness</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                                {errors.absenceReason && (
                                    <FormHelperText>{errors.absenceReason}</FormHelperText>
                                )}
                            </FormControl>

                            {/* Other Reason Text Field - Only shown if "Other" is selected */}
                            {formData.absenceReason === 'Other' && (
                                <TextField
                                    fullWidth
                                    label="Please specify"
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
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20}/> : null}
                    onClick={handleSubmit}
                >
                    {submitting ? 'Submitting...' : 'Submit'}
                </Button>
            </DialogActions>

            <NotificationBar snackbar={snackBar} setSnackbar={setSnackBar}/>
        </Dialog>
    );
};

export default DailyStatusFormDialog;
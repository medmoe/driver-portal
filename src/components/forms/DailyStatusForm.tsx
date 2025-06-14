import React, {useCallback, useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';

// import {
//     Box,
//     Button,
//     Checkbox,
//     CircularProgress,
//     Container,
//     FormControl,
//     FormControlLabel,
//     FormGroup,
//     FormHelperText,
//     FormLabel,
//     MenuItem,
//     Paper,
//     Radio,
//     RadioGroup,
//     Select,
//     TextField,
//     Typography
// } from '@mui/material';
import {type SelectChangeEvent} from '@mui/material/Select';

// Define types for form data
interface FormData {
    date: string;
    time: string;
    load: string;
    mileage: string;
    deliveryAreas: string[];
    driverStatus: 'active' | 'absent';
    absenceReason: string;
    otherReason: string;
}

// Define types for API response
interface DeliveryArea {
    id: string;
    name: string;
}

const DailyStatusForm: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>([]);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Form state
    const [formData, setFormData] = useState<FormData>({
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}),
        deliveryAreas: [],
        driverStatus: 'active',
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
    }>({});

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now);
            setFormData(prev => ({
                ...prev,
                time: now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            }));
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    // Fetch delivery areas from API
    useEffect(() => {
        const fetchDeliveryAreas = async () => {
            setLoading(true);
            try {
                // In a real app, this would be an actual API call
                // For now, we'll simulate it with a timeout and mock data
                await new Promise(resolve => setTimeout(resolve, 500));

                const mockAreas: DeliveryArea[] = [
                    {id: '1', name: 'North Zone'},
                    {id: '2', name: 'South Zone'},
                    {id: '3', name: 'Downtown'}
                ];

                setDeliveryAreas(mockAreas);
            } catch (error) {
                console.error('Error fetching delivery areas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDeliveryAreas();
    }, []);

    // Load draft from localStorage
    useEffect(() => {
        const savedDraft = localStorage.getItem('dailyStatusFormDraft');
        if (savedDraft) {
            try {
                const parsedDraft = JSON.parse(savedDraft);
                // Update only if the draft is from today
                if (parsedDraft.date === new Date().toLocaleDateString()) {
                    setFormData(parsedDraft);
                }
            } catch (error) {
                console.error('Error parsing saved draft:', error);
            }
        }
    }, []);

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
        } = {};

        if (formData.driverStatus === 'absent') {
            if (!formData.absenceReason) {
                newErrors.absenceReason = 'Please select a reason for absence';
            }

            if (formData.absenceReason === 'Other' && !formData.otherReason.trim()) {
                newErrors.otherReason = 'Please specify the reason';
            }
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
            // In a real app, this would be an actual API call
            // For now, we'll simulate it with a timeout
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Simulate API call to submit form
            // await fetch('/api/driver/submissions/', {
            //   method: 'POST',
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            //   body: JSON.stringify(formData),
            // });

            // Clear the draft from localStorage after successful submission
            localStorage.removeItem('dailyStatusFormDraft');

            // Redirect to dashboard
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle checkbox changes for delivery areas
    const handleDeliveryAreaChange = (areaId: string) => {
        setFormData(prev => {
            const updatedAreas = prev.deliveryAreas.includes(areaId)
                ? prev.deliveryAreas.filter(id => id !== areaId)
                : [...prev.deliveryAreas, areaId];

            return {
                ...prev,
                deliveryAreas: updatedAreas
            };
        });
    };

    // Handle radio button changes for driver status
    const handleDriverStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const status = e.target.value as 'active' | 'absent';
        setFormData(prev => ({
            ...prev,
            driverStatus: status
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

    // Handle cancel button
    const handleCancel = () => {
        navigate('/dashboard');
    };

    return (
        <Container component="main" maxWidth="sm">
            <Paper
                elevation={3}
                sx={{
                    mt: 8,
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    Daily Status Form
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{mt: 2}}>
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
                                fullWidth
                                label="Load (kg)"
                                type="number"
                                InputProps={{inputProps: {min: 0}}}
                                value={formData.load || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    load: e.target.value
                                }))}
                            />
                            <TextField
                                fullWidth
                                label="Mileage (km)"
                                type="number"
                                InputProps={{inputProps: {min: 0}}}
                                value={formData.mileage || ''}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    mileage: e.target.value
                                }))}
                            />
                        </Box>
                    </FormControl>

                    {/* Delivery Areas Section */}
                    <FormControl
                        component="fieldset"
                        sx={{mb: 3, width: '100%'}}
                        error={!!errors.deliveryAreas}
                    >
                        <FormLabel component="legend">📍 Delivery Areas Covered</FormLabel>
                        {loading ? (
                            <Box sx={{display: 'flex', justifyContent: 'center', my: 2}}>
                                <CircularProgress size={24}/>
                            </Box>
                        ) : (
                            <FormGroup>
                                {deliveryAreas.map((area) => (
                                    <FormControlLabel
                                        key={area.id}
                                        control={
                                            <Checkbox
                                                checked={formData.deliveryAreas.includes(area.id)}
                                                onChange={() => handleDeliveryAreaChange(area.id)}
                                            />
                                        }
                                        label={area.name}
                                    />
                                ))}
                            </FormGroup>
                        )}
                        {errors.deliveryAreas && (
                            <FormHelperText>{errors.deliveryAreas}</FormHelperText>
                        )}
                    </FormControl>

                    {/* Driver Status Section */}
                    <FormControl component="fieldset" sx={{mb: 3, width: '100%'}}>
                        <FormLabel component="legend">🚦 Driver Status</FormLabel>
                        <RadioGroup
                            value={formData.driverStatus}
                            onChange={handleDriverStatusChange}
                        >
                            <FormControlLabel
                                value="active"
                                control={<Radio/>}
                                label="Active"
                            />
                            <FormControlLabel
                                value="absent"
                                control={<Radio/>}
                                label="Absent"
                            />
                        </RadioGroup>
                    </FormControl>

                    {/* Absence Reason Section - Only shown if driver is absent */}
                    {formData.driverStatus === 'absent' && (
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

                    {/* Form Buttons */}
                    <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 4}}>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={submitting}
                            startIcon={submitting ? <CircularProgress size={20}/> : null}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default DailyStatusForm;
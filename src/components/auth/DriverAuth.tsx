import React, {useEffect, useRef, useState} from 'react';
import {Box, Button, Container, FormHelperText, InputAdornment, Paper, TextField, Typography} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {useNavigate} from 'react-router-dom';

interface FormData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date | null;
    accessCode: string;
}

interface FormErrors {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    accessCode: string;
    apiError: string;
}

const DriverAuth: React.FC = () => {
    const navigate = useNavigate();
    const firstNameInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        dateOfBirth: null,
        accessCode: ''
    });

    const [errors, setErrors] = useState<FormErrors>({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        accessCode: '',
        apiError: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-focus on first field when component mounts
    useEffect(() => {
        if (firstNameInputRef.current) {
            firstNameInputRef.current.focus();
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        if (name === 'accessCode') {
            // Only allow digits and limit to 6 characters
            const numericValue = value.replace(/\D/g, '').slice(0, 6);
            setFormData({...formData, [name]: numericValue});
        } else {
            setFormData({...formData, [name]: value});
        }

        // Clear error when user types
        if (errors[name as keyof FormErrors]) {
            setErrors({...errors, [name]: ''});
        }
    };

    const handleDateChange = (date: Date | null) => {
        setFormData({...formData, dateOfBirth: date});
        if (errors.dateOfBirth) {
            setErrors({...errors, dateOfBirth: ''});
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {
            firstName: '',
            lastName: '',
            dateOfBirth: '',
            accessCode: '',
            apiError: ''
        };

        let isValid = true;

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
            isValid = false;
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
            isValid = false;
        }

        if (!formData.dateOfBirth) {
            newErrors.dateOfBirth = 'Date of birth is required';
            isValid = false;
        }

        if (!formData.accessCode) {
            newErrors.accessCode = 'Access code is required';
            isValid = false;
        } else if (formData.accessCode.length !== 6) {
            newErrors.accessCode = 'Access code must be 6 digits';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setErrors({...errors, apiError: ''});

        try {
            // API call to authenticate driver
            const response = await fetch('/api/driver/auth/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    dateOfBirth: formData.dateOfBirth,
                    accessCode: formData.accessCode
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401) {
                    setErrors({...errors, accessCode: 'Incorrect code, try again'});
                } else {
                    setErrors({...errors, apiError: data.message || 'Authentication failed'});
                }
                return;
            }

            // Redirect to dashboard on success
            navigate('/dashboard');

        } catch (error) {
            setErrors({...errors, apiError: 'Network error. Please try again.'});
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Paper
                elevation={3}
                sx={{
                    mt: 8,
                    p: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography component="h1" variant="h5" sx={{mb: 3}}>
                    DRIVER PORTAL LOGIN
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{width: '100%'}}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        name="firstName"
                        autoComplete="given-name"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        error={!!errors.firstName}
                        helperText={errors.firstName}
                        inputRef={firstNameInputRef}
                        sx={{mb: 2}}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        error={!!errors.lastName}
                        helperText={errors.lastName}
                        sx={{mb: 2}}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Date of Birth"
                            value={formData.dateOfBirth}
                            onChange={handleDateChange}
                            slotProps={{
                                textField: {
                                    required: true,
                                    fullWidth: true,
                                    margin: "normal",
                                    error: !!errors.dateOfBirth,
                                    helperText: errors.dateOfBirth
                                }
                            }}
                            sx={{mb: 2, width: '100%'}}
                        />
                    </LocalizationProvider>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="accessCode"
                        label="Access Code"
                        name="accessCode"
                        value={formData.accessCode}
                        onChange={handleInputChange}
                        error={!!errors.accessCode}
                        helperText={errors.accessCode}
                        inputProps={{
                            maxLength: 6,
                            inputMode: 'numeric',
                            pattern: '[0-9]*'
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {formData.accessCode.length}/6
                                </InputAdornment>
                            ),
                        }}
                        sx={{mb: 2}}
                    />

                    {errors.apiError && (
                        <FormHelperText error sx={{mb: 2, textAlign: 'center'}}>
                            {errors.apiError}
                        </FormHelperText>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        disabled={isSubmitting}
                        sx={{mt: 2, mb: 2}}
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>

                    <Typography variant="body2" color="text.secondary" align="center">
                        Contact fleet manager if you forgot your code
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default DriverAuth;
import React, {useEffect, useRef, useState} from 'react';
import {Box, Button, Container, FormHelperText, InputAdornment, Paper, TextField, Typography} from '@mui/material';
import {DatePicker} from '@mui/x-date-pickers/DatePicker';
import {LocalizationProvider} from '@mui/x-date-pickers/LocalizationProvider';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {useNavigate} from 'react-router-dom';
import axios from "axios";
import {API} from "../../constants.ts";
import LanguageSwitcher from '../common/LanguageSwitcher.tsx';
import {useTranslation} from "react-i18next";

interface FormData {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    access_code: string;
}

interface FormErrors {
    first_name: string;
    last_name: string;
    date_of_birth: string;
    access_code: string;
    apiError: string;
}

const DriverAuth: React.FC = () => {
    const navigate = useNavigate();
    const firstNameInputRef = useRef<HTMLInputElement>(null);
    const {t} = useTranslation();

    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        access_code: ''
    });

    const [errors, setErrors] = useState<FormErrors>({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        access_code: '',
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
        setFormData({...formData, [name]: value});

        // Clear error when user types
        if (errors[name as keyof FormErrors]) {
            setErrors({...errors, [name]: ''});
        }
    };

    const handleDateChange = (date: Date | null) => {
        setFormData({...formData, date_of_birth: date?.toISOString().split('T')[0] || ''});
        if (errors.date_of_birth) {
            setErrors({...errors, date_of_birth: ''});
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {
            first_name: '',
            last_name: '',
            date_of_birth: '',
            access_code: '',
            apiError: ''
        };

        let isValid = true;

        if (!formData.first_name.trim()) {
            newErrors.first_name = `${t('auth.firstName')} ${t('auth.errorMessages.isRequired')}`;
            isValid = false;
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = `${t('auth.lastName')} ${t('auth.errorMessages.isRequired')}`;
            isValid = false;
        }

        if (!formData.date_of_birth) {
            newErrors.date_of_birth = `${t('auth.dateOfBirth')} ${t('auth.errorMessages.isRequired')}`;
            isValid = false;
        }

        if (!formData.access_code) {
            newErrors.access_code = `${t('auth.accessCode')} ${t('auth.errorMessages.isRequired')}`;
            isValid = false;
        } else if (formData.access_code.length !== 8) {
            newErrors.access_code = t('auth.errorMessages.length');
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
            const response = await axios.post(`${API}drivers/login/`, formData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true
            })
            console.log(response);

            // Redirect to dashboard on success
            navigate('/dashboard');

        } catch (error: any) {
            setErrors({...errors, apiError: error.response.data.message});
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
                <Box sx={{display: 'flex', justifyContent: 'flex-end', width: '100%', mb: 2}}>
                    <LanguageSwitcher/>
                </Box>


                <Typography component="h1" variant="h5" sx={{mb: 3}}>{t('auth.title')}</Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{width: '100%'}}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="firstName"
                        label={t('auth.firstName')}
                        name="first_name"
                        autoComplete="given-name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        error={!!errors.first_name}
                        helperText={errors.first_name}
                        inputRef={firstNameInputRef}
                        sx={{mb: 2}}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="lastName"
                        label={t('auth.lastName')}
                        name="last_name"
                        autoComplete="family-name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        error={!!errors.last_name}
                        helperText={errors.last_name}
                        sx={{mb: 2}}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label={t('auth.dateOfBirth')}
                            value={Date.parse(formData.date_of_birth) ? new Date(formData.date_of_birth) : null}
                            onChange={handleDateChange}
                            slotProps={{
                                textField: {
                                    required: true,
                                    fullWidth: true,
                                    margin: "normal",
                                    error: !!errors.date_of_birth,
                                    helperText: errors.date_of_birth
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
                        label={t('auth.accessCode')}
                        name="access_code"
                        value={formData.access_code}
                        onChange={handleInputChange}
                        error={!!errors.access_code}
                        helperText={errors.access_code}
                        inputProps={{
                            maxLength: 8,
                            inputMode: 'numeric',
                            pattern: '^[2-9A-HJ-NP-Z]{6}-[2-9A-HJ-NP-Z]{1}$'
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    {formData.access_code.length}/8
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
                        {isSubmitting ? t('common.submitting') : t('common.submit')}
                    </Button>

                    <Typography variant="body2" color="text.secondary" align="center">
                        {t('auth.note')}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default DriverAuth;
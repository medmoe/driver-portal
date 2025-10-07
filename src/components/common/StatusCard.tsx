import React from 'react';
import {format, parseISO} from 'date-fns';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Edit from '@mui/icons-material/Edit';
import Visibility from '@mui/icons-material/Visibility';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import type {FormData} from '../../types';

interface StatusCardProps {
    form: FormData;
}

const StatusCard: React.FC<StatusCardProps> = ({form}) => {
    const {t} = useTranslation();
    const navigate = useNavigate();

    // Determine if the status is active or absent
    const isActive = form.status === true;
    // Define styles based on status
    const cardStyle = {
        height: '100%',
        borderLeft: isActive ? '4px solid #4caf50' : '4px solid #f44336', // Green for active, red for absent
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 3
        }
    };

    const statusChipStyle = {
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: isActive ? '#4caf50' : '#f44336', // Green for active, red for absent
    };

    return (
        <Grid
            sx={{
                width: {
                    xs: '100%',    // Full width on extra-small screens
                    sm: '50%',     // Half width on small screens
                    md: '33.33%'   // One-third width on medium screens and up
                },
                padding: 1
            }}
        >
            <Card variant="outlined" sx={cardStyle}>
                <CardContent>
                    <Typography variant="h6" component="div" gutterBottom>
                        {format(parseISO(form.date), 'MMM d, yyyy')}
                    </Typography>
                    <Typography color="text.secondary" sx={{mb: 1.5}}>
                        {form.time}
                    </Typography>

                    {/* Status chip - prominently displayed */}
                    <Chip
                        label={isActive ? t('dashboard.forms.formCard.active') : t('dashboard.forms.formCard.absent')}
                        sx={{...statusChipStyle, mb: 2}}
                    />

                    <Divider sx={{my: 1}}/>

                    <Box sx={{mt: 1}}>
                        <Typography variant="body2" component="div" display="flex" justifyContent="space-between">
                            <span>{t('dashboard.forms.formCard.load')}</span>
                            <span>
                {form.load ? Number(form.load).toLocaleString() : '-'} {t('dashboard.forms.formCard.loadUnit')}
              </span>
                        </Typography>
                        <Typography variant="body2" component="div" display="flex" justifyContent="space-between">
                            <span>{t('dashboard.forms.formCard.mileage')}</span>
                            <span>
                {form.mileage ? Number(form.mileage).toLocaleString() : '-'} {t('dashboard.forms.formCard.mileageUnit')}
              </span>
                        </Typography>

                        {/* Show absence reason if applicable */}
                        {!isActive && form.absence_type && (
                            <Typography
                                variant="body2"
                                component="div"
                                display="flex"
                                justifyContent="space-between"
                                sx={{mt: 1, fontStyle: 'italic'}}
                            >
                                <span>{t('dialog.dailyStatusForm.absenceReason.title')}</span>
                                <span>{form.absence_type}</span>
                            </Typography>
                        )}
                    </Box>
                </CardContent>
                <CardActions>
                    <Button
                        size="small"
                        startIcon={<Visibility/>}
                        onClick={() => navigate(`/daily-status/view/${form.id}`)}
                    >
                        {t('dashboard.forms.formCard.viewButton')}
                    </Button>
                    <Button
                        size="small"
                        startIcon={<Edit/>}
                        onClick={() => navigate(`/daily-status/edit/${form.id}`)}
                    >
                        {t('dashboard.forms.formCard.editButton')}
                    </Button>
                </CardActions>
            </Card>
        </Grid>
    );
};

export default StatusCard;
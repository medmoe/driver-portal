import React, {useMemo} from 'react';
import {format, parseISO} from 'date-fns';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CheckCircle from '@mui/icons-material/CheckCircle';
import {type FormListResponse} from '../../types';
import {useTranslation} from 'react-i18next';

interface DailyFormsTodoListProps {
    formListResponse: FormListResponse;
    isDuePassed: () => boolean;
    setOpenFormDialog: (open: boolean) => void;
    setSelectedDate: (date: string) => void;
}

const DailyFormsTodoList: React.FC<DailyFormsTodoListProps> = ({
                                                                   formListResponse,
                                                                   isDuePassed,
                                                                   setOpenFormDialog,
                                                                   setSelectedDate,
                                                               }) => {
    const {t} = useTranslation();
    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');

    // Check if today's form is already filled
    const isTodayFormFilled = useMemo(() => {
        return formListResponse.results.some(form =>
            format(parseISO(form.date), 'yyyy-MM-dd') === todayStr
        );
    }, [formListResponse.results, todayStr]);

    // If today's form is already filled, show completion message
    if (isTodayFormFilled) {
        return (
            <Box sx={{
                p: 2,
                textAlign: 'center',
                bgcolor: 'success.light',
                borderRadius: 1,
                color: 'success.contrastText'
            }}>
                <Typography variant="body1">
                    {t('dashboard.forms.todoList.allCompleted')}
                </Typography>
            </Box>
        );
    }

    // Otherwise, show only today's form if not filled
    return (
        <List>
            <ListItem
                key={todayStr}
                component={'button'}
                onClick={() => {
                    setSelectedDate(todayStr);
                    setOpenFormDialog(true);
                }}
                sx={{
                    border: isDuePassed() ? '2px solid' : '1px solid rgba(0, 0, 0, 0.12)',
                    borderColor: isDuePassed() ? 'error.main' : 'rgba(0, 0, 0, 0.12)',
                    borderRadius: 1,
                    mb: 2,
                    position: 'relative',
                    '&:hover': {
                        bgcolor: 'action.hover',
                    },
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                }}
            >
                {isDuePassed() && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -10,
                            right: 10,
                            bgcolor: 'error.main',
                            color: 'error.contrastText',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            fontSize: '0.75rem',
                            fontWeight: 'bold'
                        }}
                    >
                        {t('dashboard.forms.todoList.lateLabel')}
                    </Box>
                )}
                <ListItemIcon>
                    <CheckCircle color={isDuePassed() ? "error" : "success"}/>
                </ListItemIcon>
                <ListItemText
                    primary={t('dashboard.forms.todoList.dailyStatusForm')}
                    secondary={isDuePassed()
                        ? t('dashboard.forms.todoList.dueTodayLate')
                        : t('dashboard.forms.todoList.dueToday')
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
    );
};

export default DailyFormsTodoList;
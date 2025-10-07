import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {useTranslation} from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
    userName?: string;
    onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({userName, onLogout}) => {
    const {t} = useTranslation();

    return (
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2}}>
            <Typography variant="h5">
                {t('dashboard.greeting', {firstName: userName})}
            </Typography>
            <LanguageSwitcher/>
            <Button
                variant="contained"
                color="primary"
                onClick={onLogout}
                size="small"
            >
                {t('dashboard.logout')}
            </Button>
        </Box>
    );
};

export default Header;
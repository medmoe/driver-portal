import {Button, Stack} from '@mui/material';
import {useTranslation} from 'react-i18next';

const LanguageSwitcher = () => {
    const {i18n} = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Stack direction="row" spacing={1}>
            <Button
                variant={i18n.language === 'en' ? 'contained' : 'outlined'}
                onClick={() => changeLanguage('en')}
                size="small"
            >
                English
            </Button>
            <Button
                variant={i18n.language === 'ar' ? 'contained' : 'outlined'}
                onClick={() => changeLanguage('ar')}
                size="small"
            >
                العربية
            </Button>
        </Stack>
    );
};

export default LanguageSwitcher;
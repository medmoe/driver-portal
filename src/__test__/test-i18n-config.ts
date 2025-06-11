import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
    en: {
        translation: {
            // Auth
            'auth.title': 'Driver Login',
            'auth.firstName': 'First Name',
            'auth.lastName': 'Last Name',
            'auth.dateOfBirth': 'Date of Birth',
            'auth.accessCode': 'Access Code',
            'auth.note': 'Contact fleet manager if you forgot your code or if you had issues login in',
            'auth.errorMessages.isRequired': 'is required',
            'auth.errorMessages.length': 'Access code must be 8 characters long',
            'auth.errorMessages.invalid': 'Invalid credentials',

            //common
            'common.submit': 'Submit',
            'common.submitting': 'Submitting...'
        }
    }
}
i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: 'en',
        fallbackLng: 'en',
        debug: true,
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: false, // this is important for tests
        }
    })
export default i18n;
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
            'common.submitting': 'Submitting...',

            // Daily Status Form Dialog Translations
            'dialog.dailyStatusForm.title': 'Daily Status Form',
            'dialog.dailyStatusForm.date': 'Date',
            'dialog.dailyStatusForm.time': 'Time',
            'dialog.dailyStatusForm.vehicleStatistics.title': '🚚 Vehicle Statistics',
            'dialog.dailyStatusForm.vehicleStatistics.load': 'Load (kg)',
            'dialog.dailyStatusForm.vehicleStatistics.loadError': 'Please enter a valid load',
            'dialog.dailyStatusForm.vehicleStatistics.mileage': 'Mileage (km)',
            'dialog.dailyStatusForm.vehicleStatistics.mileageError': 'Please enter a valid mileage',
            'dialog.dailyStatusForm.deliveryAreas.title': '📍 Delivery Areas Covered',
            'dialog.dailyStatusForm.deliveryAreas.addDeliveryArea': 'Add delivery area',
            'dialog.dailyStatusForm.deliveryAreas.placeholder': 'Type and press Enter to add delivery area',
            'dialog.dailyStatusForm.deliveryAreas.addButton': 'Add',
            'dialog.dailyStatusForm.driverStatus.title': '🚦 Driver Status',
            'dialog.dailyStatusForm.driverStatus.active': 'Active',
            'dialog.dailyStatusForm.driverStatus.absent': 'Absent',
            'dialog.dailyStatusForm.absenceReason.title': 'Reason for Absence',
            'dialog.dailyStatusForm.absenceReason.maintenance': 'Maintenance',
            'dialog.dailyStatusForm.absenceReason.sickness': 'Sickness',
            'dialog.dailyStatusForm.absenceReason.other': 'Other',
            'dialog.dailyStatusForm.absenceReason.pleaseSpecify': 'Please specify',
            'dialog.dailyStatusForm.absenceReason.reasonRequired': 'Please select a reason for absence',
            'dialog.dailyStatusForm.absenceReason.otherReasonRequired': 'Please specify the reason',
            'dialog.dailyStatusForm.buttons.cancel': 'Cancel',
            'dialog.dailyStatusForm.buttons.submit': 'Submit',
            'dialog.dailyStatusForm.buttons.submitting': 'Submitting...',
            'dialog.dailyStatusForm.notifications.success': 'Daily status form submitted successfully',
            'dialog.dailyStatusForm.notifications.loginError': 'You are not logged in. Please log in to submit the form.',
            'dialog.dailyStatusForm.notifications.submitError': 'Failed to submit form. Please try again.',

// Dashboard Translations
            'dashboard.greeting': 'Hi, {{firstName}}!',
            'dashboard.logout': 'Logout',
            'dashboard.tabs.notifications': 'Notifications',
            'dashboard.tabs.forms': 'Forms',
            'dashboard.notifications.noNotifications': 'No new notifications at this time. System alerts will appear here.',
            'dashboard.forms.todo': 'TO-DO:',
            'dashboard.forms.todoList.dailyStatusForm': 'Daily Status Form',
            'dashboard.forms.todoList.dueToday': 'Due: Today 9:00 AM',
            'dashboard.forms.todoList.dueTodayLate': 'Due: Today 9:00 AM (Late)',
            'dashboard.forms.todoList.lateLabel': 'LATE',
            'dashboard.forms.todoList.allCompleted': '✅ You\'ve completed all your forms. Great job!',
            'dashboard.forms.submittedForms': 'SUBMITTED FORMS:',
            'dashboard.forms.formCard.status': 'Status:',
            'dashboard.forms.formCard.active': 'Active',
            'dashboard.forms.formCard.absent': 'Absent',
            'dashboard.forms.formCard.load': 'Load:',
            'dashboard.forms.formCard.loadUnit': 'kg',
            'dashboard.forms.formCard.mileage': 'Mileage:',
            'dashboard.forms.formCard.mileageUnit': 'km',
            'dashboard.forms.formCard.viewButton': 'View',
            'dashboard.forms.formCard.editButton': 'Edit',
            'dashboard.forms.noSubmittedForms': 'No submitted forms found. Your completed forms will appear here.',

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
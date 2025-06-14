import React from 'react';
import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {vi} from 'vitest';
import {BrowserRouter} from 'react-router-dom';
import DailyStatusForm from './DailyStatusForm';

declare const global: { Date: typeof Date };
// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('DailyStatusForm', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorageMock.clear();

        // Mock Date to have a consistent date for testing
        const mockDate = new Date('2024-06-10T08:15:00');
        vi.spyOn(global, 'Date').mockImplementation(() => mockDate as unknown as Date);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the form with auto-filled date and time', () => {
        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        expect(screen.getByText('Daily Status Form')).toBeInTheDocument();

        // Check auto-filled date and time
        const dateField = screen.getByLabelText('Date');
        const timeField = screen.getByLabelText('Time');

        expect(dateField).toHaveValue('6/10/2024');
        expect(timeField).toHaveValue('8:15 AM');
    });

    it('displays delivery areas from API', async () => {
        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        // Wait for the mock API call to complete
        await waitFor(() => {
            expect(screen.getByText('North Zone')).toBeInTheDocument();
            expect(screen.getByText('South Zone')).toBeInTheDocument();
            expect(screen.getByText('Downtown')).toBeInTheDocument();
        });
    });

    it('shows/hides absence reason based on driver status', async () => {
        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        // Initially, absence reason should not be visible
        expect(screen.queryByText('Reason for Absence')).not.toBeInTheDocument();

        // Select 'Absent' status
        fireEvent.click(screen.getByLabelText('Absent'));

        // Now absence reason should be visible
        expect(screen.getByText('Reason for Absence')).toBeInTheDocument();

        // Select 'Active' status again
        fireEvent.click(screen.getByLabelText('Active'));

        // Absence reason should be hidden again
        expect(screen.queryByText('Reason for Absence')).not.toBeInTheDocument();
    });

    it('shows text input when "Other" is selected as absence reason', async () => {
        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        // Select 'Absent' status
        fireEvent.click(screen.getByLabelText('Absent'));

        // Select 'Other' as absence reason
        fireEvent.mouseDown(screen.getByRole('button', {name: /maintenance/i}));
        fireEvent.click(screen.getByText('Other'));

        // Text input should be visible
        expect(screen.getByLabelText('Please specify')).toBeInTheDocument();
    });

    it('validates form when submitting', async () => {
        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        // Select 'Absent' status
        fireEvent.click(screen.getByLabelText('Absent'));

        // Select 'Other' as absence reason
        fireEvent.mouseDown(screen.getByRole('button', {name: /maintenance/i}));
        fireEvent.click(screen.getByText('Other'));

        // Submit without filling the required field
        fireEvent.click(screen.getByRole('button', {name: /submit/i}));

        // Should show validation error
        await waitFor(() => {
            expect(screen.getByText('Please specify the reason')).toBeInTheDocument();
        });

        // Fill the required field
        fireEvent.change(screen.getByLabelText('Please specify'), {target: {value: 'Family emergency'}});

        // Submit again
        fireEvent.click(screen.getByRole('button', {name: /submit/i}));

        // Should navigate to dashboard
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
        });
    });

    it('auto-saves form data to localStorage', async () => {
        vi.useFakeTimers();

        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        // Make some changes to the form
        fireEvent.click(screen.getByLabelText('Absent'));

        // Advance timer by 30 seconds to trigger auto-save
        vi.advanceTimersByTime(30000);

        // Check if data was saved to localStorage
        const savedData = JSON.parse(localStorageMock.getItem('dailyStatusFormDraft') || '{}');
        expect(savedData.driverStatus).toBe('absent');

        vi.useRealTimers();
    });

    it('loads draft from localStorage on mount', () => {
        // Set up a draft in localStorage
        const draftData = {
            date: new Date().toLocaleDateString(),
            time: '8:15 AM',
            deliveryAreas: ['1', '3'],
            driverStatus: 'absent',
            absenceReason: 'Sickness',
            otherReason: ''
        };
        localStorageMock.setItem('dailyStatusFormDraft', JSON.stringify(draftData));

        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        // Check if form is pre-filled with draft data
        expect(screen.getByLabelText('Absent')).toBeChecked();

        // Wait for delivery areas to load
        waitFor(() => {
            // Check if checkboxes are checked according to draft
            const checkboxes = screen.getAllByRole('checkbox');
            expect(checkboxes[0]).toBeChecked(); // North Zone
            expect(checkboxes[1]).not.toBeChecked(); // South Zone
            expect(checkboxes[2]).toBeChecked(); // Downtown
        });
    });

    it('clears localStorage draft after successful submission', async () => {
        // Set up a draft in localStorage
        const draftData = {
            date: new Date().toLocaleDateString(),
            time: '8:15 AM',
            deliveryAreas: ['1'],
            driverStatus: 'active',
            absenceReason: '',
            otherReason: ''
        };
        localStorageMock.setItem('dailyStatusFormDraft', JSON.stringify(draftData));

        render(
            <BrowserRouter>
                <DailyStatusForm/>
            </BrowserRouter>
        );

        // Submit the form
        fireEvent.click(screen.getByRole('button', {name: /submit/i}));

        // Wait for submission to complete
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
            expect(localStorageMock.getItem('dailyStatusFormDraft')).toBeNull();
        });
    });
});
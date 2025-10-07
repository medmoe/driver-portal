import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '../../__test__/test-utils';
import {BrowserRouter, useNavigate} from 'react-router-dom';
import '@testing-library/jest-dom';
import useAuthStore from '../../stores/useAuthStore';
import axios from 'axios';
import Dashboard from './Dashboard';
import type {FormData, FormListResponse} from '../../types';

// Add global type declaration for TypeScript
declare const global: typeof globalThis;

// Define interfaces for mock component props
interface StatusCardProps {
    form: FormData;
}

interface DailyFormsTodoListProps {
    formListResponse: FormListResponse;
    isDuePassed: () => boolean;
    setOpenFormDialog: (open: boolean) => void;
    setSelectedDate: (date: string) => void;
}

interface HeaderProps {
    userName?: string;
    onLogout: () => void;
}

interface DailyStatusFormDialogProps {
    open: boolean;
    onClose: () => void;
    setFormListResponse: (data: FormListResponse) => void;
    formListResponse: FormListResponse;
    selectedDate: string;
}

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('axios');
vi.mock('../../stores/useAuthStore');
vi.mock('../common/StatusCard', () => ({
    default: ({form}: StatusCardProps) => (
        <div data-testid="status-card" data-form-id={form.id}>
            {form.date} - {form.status ? 'Active' : 'Absent'}
        </div>
    ),
}));

vi.mock('../common/DailyFormsTodoList', () => ({
    default: ({isDuePassed, setOpenFormDialog, setSelectedDate}: DailyFormsTodoListProps) => (
        <div data-testid="daily-forms-todo-list">
            <button
                onClick={() => {
                    setSelectedDate('2024-07-10');
                    setOpenFormDialog(true);
                }}
            >
                Open Form
            </button>
            <span>{isDuePassed() ? 'Past Due' : 'Not Due'}</span>
        </div>
    ),
}));

vi.mock('../common/Header', () => ({
    default: ({userName, onLogout}: HeaderProps) => (
        <div data-testid="header">
            <span>Hi, {userName}!</span>
            <button onClick={onLogout}>Logout</button>
        </div>
    ),
}));

vi.mock('../dialogs/DailyStatusFormDialog', () => ({
    default: ({open, onClose}: DailyStatusFormDialogProps) => (
        open ? (
            <div data-testid="form-dialog">
                <button onClick={onClose}>Close Dialog</button>
            </div>
        ) : null
    ),
}));

describe('Dashboard Component', () => {
    const mockNavigate = vi.fn();
    const mockAuthStore = {
        auth: {
            isAuthenticated: true,
            user: {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '1990-01-01',
                accessCode: '12345678'
            }
        }
    };

    const mockFormListResponse: FormListResponse = {
        count: '25',
        next: 'http://example.com/api/page2',
        previous: null,
        results: [
            {
                id: '1',
                date: '2024-07-01',
                time: '08:00:00',
                delivery_areas: ['Downtown'],
                status: true,
                absence_type: 'MAINTENANCE',
                otherReason: '',
                load: '1500',
                mileage: '200'
            },
            {
                id: '2',
                date: '2024-07-02',
                time: '09:00:00',
                delivery_areas: ['Suburb'],
                status: false,
                absence_type: 'SICKNESS',
                otherReason: '',
                load: '',
                mileage: ''
            }
        ]
    };

    const emptyFormListResponse: FormListResponse = {
        count: '0',
        next: null,
        previous: null,
        results: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useAuthStore as any).mockReturnValue(mockAuthStore);

        // Mock axios get to return form list data
        (axios.get as any).mockImplementation((url: string) => {
            if (url.includes('starting-shift')) {
                return Promise.resolve({data: mockFormListResponse});
            }
            return Promise.reject(new Error('Not found'));
        });

        // Mock Date to control the due status
        const mockDate = new Date('2024-07-10T08:00:00'); // Before 9 AM
        vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderDashboard = () => {
        return render(
            <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <Dashboard/>
            </BrowserRouter>
        );
    };

    it('renders header with user name', async () => {
        renderDashboard();

        // Wait for component to finish loading data
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        expect(screen.getByText('Hi, John!')).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /logout/i})).toBeInTheDocument();
    });

    it('renders tabs and starts on Forms tab by default', async () => {
        renderDashboard();

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Check tab elements
        const notificationsTab = screen.getByRole('tab', {name: /notifications/i});
        const formsTab = screen.getByRole('tab', {name: /forms/i});

        expect(notificationsTab).toBeInTheDocument();
        expect(formsTab).toBeInTheDocument();

        // Forms tab should be selected by default (index 1)
        expect(formsTab).toHaveAttribute('aria-selected', 'true');
        expect(notificationsTab).toHaveAttribute('aria-selected', 'false');

        // Forms content should be visible
        expect(screen.getByTestId('daily-forms-todo-list')).toBeInTheDocument();
    });

    it('switches between tabs correctly', async () => {
        renderDashboard();

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Initially on Forms tab
        expect(screen.getByTestId('daily-forms-todo-list')).toBeInTheDocument();

        // Click on Notifications tab
        fireEvent.click(screen.getByRole('tab', {name: /notifications/i}));

        // Should now show notifications content and hide forms content
        expect(screen.getByText(/no new notifications/i)).toBeInTheDocument();
        expect(screen.queryByTestId('daily-forms-todo-list')).not.toBeInTheDocument();

        // Click back to Forms tab
        fireEvent.click(screen.getByRole('tab', {name: /forms/i}));

        // Forms content should be visible again
        expect(screen.getByTestId('daily-forms-todo-list')).toBeInTheDocument();
        expect(screen.queryByText(/no new notifications/i)).not.toBeInTheDocument();
    });

    it('fetches and displays submitted forms', async () => {
        renderDashboard();

        // Wait for the API call to complete
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Should render status cards for each form in the response
        const statusCards = screen.getAllByTestId('status-card');
        expect(statusCards).toHaveLength(2);
        expect(statusCards[0]).toHaveAttribute('data-form-id', '1');
        expect(statusCards[1]).toHaveAttribute('data-form-id', '2');

        // Should show pagination since we have more items than can fit on a page
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('shows loading indicator while fetching forms', async () => {
        // Delay the API response
        (axios.get as any).mockImplementation(() => {
            return new Promise((resolve) => {
                setTimeout(() => resolve({data: mockFormListResponse}), 100);
            });
        });

        renderDashboard();

        // Should show loading indicator initially
        expect(screen.getByRole('progressbar')).toBeInTheDocument();

        // After loading completes, indicator should disappear and content should appear
        await waitFor(() => expect(screen.queryByRole('progressbar')).not.toBeInTheDocument());
        expect(screen.getAllByTestId('status-card')).toHaveLength(2);
    });

    it('shows empty state when no forms are available', async () => {
        // Mock empty response
        (axios.get as any).mockResolvedValueOnce({data: emptyFormListResponse});

        renderDashboard();

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Should show empty state message
        expect(screen.getByText(/no submitted forms/i)).toBeInTheDocument();

        // Should not show pagination or status cards
        expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        expect(screen.queryByTestId('status-card')).not.toBeInTheDocument();
    });

    it('handles logout correctly', async () => {
        renderDashboard();

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Click logout button
        fireEvent.click(screen.getByRole('button', {name: /logout/i}));

        // Should navigate to home page
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('opens form dialog when triggered from todo list', async () => {
        renderDashboard();

        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Dialog should not be visible initially
        expect(screen.queryByTestId('form-dialog')).not.toBeInTheDocument();

        // Click the button in the todo list to open dialog
        fireEvent.click(screen.getByRole('button', {name: 'Open Form'}));

        // Dialog should now be visible
        expect(screen.getByTestId('form-dialog')).toBeInTheDocument();

        // Click close button to dismiss dialog
        fireEvent.click(screen.getByRole('button', {name: 'Close Dialog'}));

        // Dialog should be hidden again
        expect(screen.queryByTestId('form-dialog')).not.toBeInTheDocument();
    });

    it('handles network error correctly', async () => {
        // Mock API error
        (axios.get as any).mockRejectedValueOnce({
            response: {status: 401}
        });

        renderDashboard();

        // Wait for the error to be handled
        await waitFor(() => expect(axios.get).toHaveBeenCalled());

        // Should navigate to login page on 401 error
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
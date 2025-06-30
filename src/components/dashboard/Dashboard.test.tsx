import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '../../__test__/test-utils.tsx';
import {BrowserRouter, useNavigate} from 'react-router-dom';
import '@testing-library/jest-dom';
import useAuthStore from '../../stores/useAuthStore';
import Dashboard from "./SubmittedForms.tsx";

declare const global: { Date: typeof Date };
// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('../../stores/useAuthStore', () => ({
    default: vi.fn(),
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

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
        (useAuthStore as any).mockReturnValue(mockAuthStore);

        // Mock Date to control the due status
        const mockDate = new Date('2024-06-10T08:00:00');
        vi.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <Dashboard/>
            </BrowserRouter>
        );
    };

    it('renders correctly with greeting and tabs', () => {
        renderComponent();

        // Check greeting
        expect(screen.getByText('Hi, John!')).toBeInTheDocument();

        // Check logout button
        expect(screen.getByRole('button', {name: /logout/i})).toBeInTheDocument();

        // Check tabs
        expect(screen.getByRole('tab', {name: /notifications/i})).toBeInTheDocument();
        expect(screen.getByRole('tab', {name: /forms/i})).toBeInTheDocument();

        // Forms tab should be selected by default
        expect(screen.getByRole('tab', {name: /forms/i})).toHaveAttribute('aria-selected', 'true');

        // Check Forms tab content is visible
        expect(screen.getByText('TO-DO:')).toBeInTheDocument();
        expect(screen.getByText('Daily Status Form')).toBeInTheDocument();
        expect(screen.getByText('Due: Today 9:00 AM')).toBeInTheDocument();
        expect(screen.getByText('COMPLETED:')).toBeInTheDocument();
    });

    it('switches tabs correctly', async () => {
        renderComponent();

        // Initially Forms tab should be selected
        expect(screen.getByRole('tab', {name: /forms/i})).toHaveAttribute('aria-selected', 'true');
        expect(screen.getByText('TO-DO:')).toBeInTheDocument();

        // Click on Notifications tab
        fireEvent.click(screen.getByRole('tab', {name: /notifications/i}));

        // Now Notifications tab should be selected
        await waitFor(() => {
            expect(screen.getByRole('tab', {name: /notifications/i})).toHaveAttribute('aria-selected', 'true');
            expect(screen.getByText('No new notifications at this time. System alerts will appear here.')).toBeInTheDocument();
            expect(screen.queryByText('TO-DO:')).not.toBeInTheDocument();
        });
    });

    it('shows "Late" status when past due time', async () => {
        // Mock Date to be past due time
        vi.spyOn(global, 'Date').mockRestore();
        renderComponent();
        const mockLateDate = new Date('2024-06-10T10:00:00');

        vi.spyOn(global, 'Date').mockImplementation(() => mockLateDate as any);

        // Check that the due status shows "Late"
        expect(screen.getByText('Due: Today 9:00 AM (Late)')).toBeInTheDocument();
    });

    it('navigates to home page on logout', () => {
        renderComponent();

        // Click logout button
        fireEvent.click(screen.getByRole('button', {name: /logout/i}));

        // Check that navigate was called with '/'
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });
});
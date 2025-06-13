import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen, waitFor} from '../../__test__/test-utils.tsx';
import userEvent from '@testing-library/user-event';
import {BrowserRouter, useNavigate} from 'react-router-dom';
import '@testing-library/jest-dom'
import DriverAuth from './DriverAuth';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

vi.mock('axios');

describe('DriverAuth Component', () => {
    const mockNavigate = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
    });

    const renderComponent = () => {
        return render(
            <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <DriverAuth/>
            </BrowserRouter>
        );
    };

    it('renders correctly with all form fields', () => {
        renderComponent();
        expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Access Code/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /submit/i})).toBeInTheDocument();
        expect(screen.getByText(/Contact fleet manager if you forgot your code/i)).toBeInTheDocument();
    });

    it('shows validation errors when submitting an empty form', async () => {
        renderComponent();

        const submitButton = screen.getByRole('button', {name: /submit/i});
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Last name is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Date of birth is required/i)).toBeInTheDocument();
            expect(screen.getByText(/Access code is required/i)).toBeInTheDocument();
        });
    });

    it('validates access code length', async () => {
        renderComponent();

        const accessCodeInput = screen.getByLabelText(/Access Code/i);
        await userEvent.type(accessCodeInput, '1234');

        const submitButton = screen.getByRole('button', {name: /submit/i});
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Access code must be 8 characters long/i)).toBeInTheDocument();
        });
    });

    it('clears validation errors when user types in field', async () => {
        renderComponent();

        // Trigger validation errors
        const submitButton = screen.getByRole('button', {name: /submit/i});
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/First name is required/i)).toBeInTheDocument();
        });

        // Type in the field and check if error clears
        const firstNameInput = screen.getByLabelText(/First Name/i);
        await userEvent.type(firstNameInput, 'John');

        expect(screen.queryByText(/First name is required/i)).not.toBeInTheDocument();
    });

    it('auto-focuses on first name field on component mount', () => {
        renderComponent();

        const firstNameInput = screen.getByLabelText(/First Name/i);
        expect(document.activeElement).toBe(firstNameInput);
    });

    it('shows character count for access code field', async () => {
        renderComponent();

        const accessCodeInput = screen.getByLabelText(/Access Code/i);
        expect(screen.getByText('0/8')).toBeInTheDocument();

        await userEvent.type(accessCodeInput, '1234');
        expect(screen.getByText('4/8')).toBeInTheDocument();

        await userEvent.type(accessCodeInput, '5678');
        expect(screen.getByText('8/8')).toBeInTheDocument();
    });
});
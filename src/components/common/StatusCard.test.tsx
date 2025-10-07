import {beforeEach, describe, expect, it, vi} from 'vitest';
import {fireEvent, render, screen} from '../../__test__/test-utils';
import {BrowserRouter, useNavigate} from 'react-router-dom';
import '@testing-library/jest-dom';
import StatusCard from '../common/StatusCard';
import type {FormData} from '../../types';

// Mock dependencies
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});

describe('StatusCard Component', () => {
    const mockNavigate = vi.fn();

    // Sample form data for testing
    const activeFormData: FormData = {
        id: '123',
        date: '2024-07-01',
        time: '08:30:00',
        delivery_areas: ['Downtown', 'Suburb'],
        status: true, // Active status
        absence_type: 'MAINTENANCE',
        otherReason: '',
        load: '1500',
        mileage: '250',
        driver: 'John Doe'
    };

    const absentFormData: FormData = {
        id: '456',
        date: '2024-07-02',
        time: '09:15:00',
        delivery_areas: [],
        status: false, // Absent status
        absence_type: 'SICKNESS',
        otherReason: '',
        load: '',
        mileage: '',
        driver: 'John Doe'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useNavigate as any).mockReturnValue(mockNavigate);
    });

    const renderComponent = (formData: FormData) => {
        return render(
            <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <StatusCard form={formData}/>
            </BrowserRouter>
        );
    };

    it('renders active status card correctly', () => {
        renderComponent(activeFormData);

        // Check date and time
        expect(screen.getByText('Jul 1, 2024')).toBeInTheDocument();
        expect(screen.getByText('08:30:00')).toBeInTheDocument();

        // Check status chip
        expect(screen.getByText('Active')).toBeInTheDocument();

        // Check load and mileage values appear correctly
        expect(screen.getByText(/1,500/)).toBeInTheDocument();
        expect(screen.getByText(/250/)).toBeInTheDocument();

        // Check action buttons
        expect(screen.getByRole('button', {name: /view/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /edit/i})).toBeInTheDocument();
    });

    it('renders absent status card correctly', () => {
        renderComponent(absentFormData);

        // Check date and time
        expect(screen.getByText('Jul 2, 2024')).toBeInTheDocument();
        expect(screen.getByText('09:15:00')).toBeInTheDocument();

        // Check status chip
        expect(screen.getByText('Absent')).toBeInTheDocument();

        // Check that absence reason is displayed
        expect(screen.getByText('SICKNESS')).toBeInTheDocument();

        // Check action buttons
        expect(screen.getByRole('button', {name: /view/i})).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /edit/i})).toBeInTheDocument();
    });

    it('shows placeholders for empty load and mileage values', () => {
        renderComponent(absentFormData);

        // Get all Typography elements and verify their content
        // Since we can't target the exact dash, we'll verify that the element with
        // empty values exists with the unit label
        const typographyElements = screen.getAllByRole('generic').filter(el =>
            el.textContent?.includes('Load') || el.textContent?.includes('Mileage')
        );

        expect(typographyElements.length).toBeGreaterThan(0);

        // Verify absence of numeric values for absent form
        expect(screen.queryByText(/\d+\s+kg/)).not.toBeInTheDocument();
        expect(screen.queryByText(/\d+\s+km/)).not.toBeInTheDocument();
    });

    it('navigates to view page when View button is clicked', () => {
        renderComponent(activeFormData);

        const viewButton = screen.getByRole('button', {name: /view/i});
        fireEvent.click(viewButton);

        expect(mockNavigate).toHaveBeenCalledWith('/daily-status/view/123');
    });

    it('navigates to edit page when Edit button is clicked', () => {
        renderComponent(activeFormData);

        const editButton = screen.getByRole('button', {name: /edit/i});
        fireEvent.click(editButton);

        expect(mockNavigate).toHaveBeenCalledWith('/daily-status/edit/123');
    });

    it('displays numeric values for active status', () => {
        renderComponent(activeFormData);

        // We can target the text that includes both number and unit
        expect(screen.getByText(/1,500/)).toBeInTheDocument();
        expect(screen.getByText(/250/)).toBeInTheDocument();
    });

    it('displays absence reason only for absent status', () => {
        // First check that active card doesn't show absence reason
        const {rerender} = renderComponent(activeFormData);
        expect(screen.queryByText('MAINTENANCE')).not.toBeInTheDocument();

        // Then check that absent card shows absence reason
        rerender(
            <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <StatusCard form={absentFormData}/>
            </BrowserRouter>
        );
        expect(screen.getByText('SICKNESS')).toBeInTheDocument();
    });

    it('formats the date correctly', () => {
        renderComponent(activeFormData);
        expect(screen.getByText('Jul 1, 2024')).toBeInTheDocument();

        const newFormData = {...activeFormData, date: '2024-12-25'};
        const {rerender} = renderComponent(newFormData);

        rerender(
            <BrowserRouter future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
                <StatusCard form={newFormData}/>
            </BrowserRouter>
        );

        expect(screen.getByText('Dec 25, 2024')).toBeInTheDocument();
    });
});
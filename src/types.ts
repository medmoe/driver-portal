// Define types for form data
export interface FormData {
    date: string;
    time: string;
    deliveryAreas: string[];
    status: string;
    absence_type: AbsenceType;
    otherReason: string;
    load: string;
    mileage: string;
    driver?: string;
    id?: string;
}

export interface FormListResponse {
    count: string;
    next?: string | null;
    previous?: string | null;
    results: FormData[];
}

export type AbsenceType = 'MAINTENANCE' | 'SICKNESS' | 'OTHER';
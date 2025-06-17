// Define types for form data
export interface FormData {
    date: string;
    time: string;
    load: string;
    mileage: string;
    deliveryAreas: string[];
    status: string;
    absenceReason: string;
    otherReason: string;
    driver?: string;
    id?: string;
}

export interface FormListResponse {
    count: string;
    next?: string | null;
    previous?: string | null;
    results: FormData[];
}
export interface ReceiptPosition {
    name: string;
    price: number;
    quantity: number;
    total: number;
}

export interface ReceiptData {
    institution: string;
    address: string;
    inn: string;
    datetime: string;
    receiptNumber: string;
    shiftNumber: string;
    cashier: string;
    positions: ReceiptPosition[];
    total: number;
    cash: number;
    card: number;
    tax18: number;
    tax10: number;
    kktRegNumber: string;
    fn: string;
    fd: string;
    fpd: string;
}
export interface ChequeData {
    fn: string;
    fd: string;
    fp: string;
    total: string;
    date: string;
    time: string;
}

export interface ApiResponse {
    status: 'ok' | 'error';
    data?: any;
    error?: string;
}

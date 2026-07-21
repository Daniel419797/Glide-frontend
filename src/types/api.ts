export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  pagination?: Pagination;
  meta?: { requestId?: string };
}

export interface ApiErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{ path?: string; field?: string; message: string }>;
  };
  meta?: { requestId?: string };
}

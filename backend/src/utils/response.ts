import { Response } from 'express';
import { HTTP_STATUS } from '../constants';

interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  [key: string]: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: PaginationMeta;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  data?: T,
  message?: string
): void => {
  const response: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 400,
    data,
    message,
  };
  res.status(statusCode).json(response);
};

export const sendErrorResponse = (
  res: Response,
  statusCode: number,
  error: string,
  message?: string
): void => {
  const response: ApiResponse<null> = {
    success: false,
    error,
    message,
  };
  res.status(statusCode).json(response);
};

export const sendPaginatedResponse = <T>(
  res: Response,
  data: T[],
  meta: PaginationMeta & Record<string, unknown>
): void => {
  const response: ApiResponse<T[]> = {
    success: true,
    data,
    meta,
  };
  res.status(HTTP_STATUS.OK).json(response);
};

export const buildPaginationMeta = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number
): PaginationMeta => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

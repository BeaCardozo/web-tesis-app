import { useState, useMemo, useCallback } from 'react';

interface UsePaginationProps<T> {
  data: T[];
  initialItemsPerPage?: number;
}

interface UsePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  totalPages: number;
  paginatedData: T[];
  totalItems: number;
  resetToFirstPage: () => void;
}

export function usePagination<T>({
  data,
  initialItemsPerPage = 10
}: UsePaginationProps<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPageState] = useState(initialItemsPerPage);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const safePage = useMemo(() => {
    return Math.min(currentPage, totalPages);
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const startIndex = (safePage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, safePage, itemsPerPage]);

  const setItemsPerPage = useCallback((items: number) => {
    setItemsPerPageState(items);
    setCurrentPage(1);
  }, []);

  const resetToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage: safePage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedData,
    totalItems,
    resetToFirstPage
  };
}

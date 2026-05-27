import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Typography
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowKey: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  containerSx?: SxProps<Theme>;
  tableSx?: SxProps<Theme>;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No records found.',
  rowKey,
  onRowClick,
  containerSx,
  tableSx
}: DataTableProps<T>) {
  return (
    <TableContainer component={Paper} sx={{ boxShadow: 'none', ...containerSx }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={40} />
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
            {emptyMessage}
          </Typography>
        </Box>
      ) : (
        <Table sx={{ minWidth: 650, ...tableSx }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align || 'left'}
                  sx={{ fontWeight: 700 }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={rowKey(row)}
                hover
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                sx={{
                  cursor: onRowClick ? 'pointer' : 'default',
                  ...(onRowClick && {
                    '&:last-child borderCell': { border: 0 }
                  })
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                  >
                    {col.render ? col.render(row) : (row as any)[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
}

'use client';

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeadCell, TableRow } from 'flowbite-react';

type BaseTableProps<T extends object> = {
  title?: string;
  data: T[];
  columns: ColumnDef<T, any>[];
};

export default function BaseTable<T extends object>({ title, data, columns }: BaseTableProps<T>) {
  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-x-auto">
      <h1
        id="default-title"
        className="font-semibold text-gray-900 dark:text-white text-center my-4 text-2xl"
      >
        {title}
      </h1>
      <Table>
        <TableHead>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHeadCell
                  key={header.id}
                  scope="col"
                  className="px-6 py-3 font-medium"
                  colSpan={header.colSpan}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </TableHeadCell>
              ))}
            </TableRow>
          ))}
        </TableHead>
        <TableBody>
          {table.getRowModel().rows.map((row, i) => (
            <TableRow className="bg-white dark:border-gray-700 dark:bg-gray-800" key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

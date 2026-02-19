'use client';

import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

export default function BaseTable({ title, data, columns }) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    // <Card className="w-full">
    //   <CardHeader className=" text-white bg-rolandGarrosRed border-b-2 border-solid border-black">
    //     <CardTitle className="text-2xl sm:text-4xl font-bold flex items-center">
    //       <CircleDot className="w-8 h-8 mr-2" />
    //       {title}
    //     </CardTitle>
    //   </CardHeader>
    //   <CardContent className="p-0">
    // <div className="relative overflow-x-auto">
    <table className="text-xl">
      <thead className="font-bold bg-rolandGarrosRed">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id} className="text-gray-300" colSpan={header.colSpan}>
                {header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row, i) => (
          <tr key={row.id} className={`${i % 2 ? 'bg-orange-300' : 'bg-orange-500'}`}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
    // </div>
    //   </CardContent>
    // </Card>
  );
}

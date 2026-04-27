"use client"

import React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronUp, ChevronDown } from "lucide-react"

export interface Column<T> {
  header: string
  accessor: keyof T
  render?: (value: T[keyof T], item: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onSort?: (column: keyof T, direction: "asc" | "desc") => void
  sortColumn?: keyof T
  sortDirection?: "asc" | "desc"
  actions?: (item: T) => React.ReactNode
}

export function DataTable<T extends { id?: number | string }>({
  columns,
  data,
  onSort,
  sortColumn: externalSortColumn,
  sortDirection: externalSortDirection,
  actions,
}: DataTableProps<T>) {
  const [internalSortColumn, setInternalSortColumn] = React.useState<
    keyof T | undefined
  >(externalSortColumn)
  const [internalSortDirection, setInternalSortDirection] = React.useState<
    "asc" | "desc" | undefined
  >(externalSortDirection)

  const handleSort = (accessor: keyof T) => {
    if (onSort) {
      const newDirection =
        externalSortColumn === accessor && externalSortDirection === "asc"
          ? "desc"
          : "asc"
      onSort(accessor, newDirection)
    } else {
      const newDirection =
        internalSortColumn === accessor && internalSortDirection === "asc"
          ? "desc"
          : "asc"
      setInternalSortColumn(accessor)
      setInternalSortDirection(newDirection)
    }
  }

  const sortColumn = onSort ? externalSortColumn : internalSortColumn
  const sortDirection = onSort ? externalSortDirection : internalSortDirection

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortColumn]
      const bValue = b[sortColumn]

      if (aValue === bValue) return 0
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = String(aValue).localeCompare(String(bValue), undefined, {
        numeric: true,
        sensitivity: "base",
      })

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [data, sortColumn, sortDirection])

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            {columns.map((column) => (
              <TableHead
                key={String(column.accessor)}
                className={column.className}
              >
                <button
                  onClick={() => column.sortable && handleSort(column.accessor)}
                  className={`flex items-center gap-2 ${
                    column.sortable
                      ? "cursor-pointer hover:text-foreground"
                      : ""
                  }`}
                  disabled={!column.sortable}
                >
                  {column.header}
                  {column.sortable &&
                    sortColumn === column.accessor &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </button>
              </TableHead>
            ))}
            {actions && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + (actions ? 1 : 0)}
                className="py-8 text-center text-muted-foreground"
              >
                No data found
              </TableCell>
            </TableRow>
          ) : (
            sortedData.map((item, index) => (
              <TableRow key={item.id || index}>
                {columns.map((column) => (
                  <TableCell
                    key={String(column.accessor)}
                    className={column.className}
                  >
                    {column.render
                      ? column.render(item[column.accessor], item)
                      : String(item[column.accessor])}
                  </TableCell>
                ))}
                {actions && <TableCell>{actions(item)}</TableCell>}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

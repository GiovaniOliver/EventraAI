'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Settings,
  Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Column<T> {
  accessorKey: keyof T
  header: string
  cell?: (info: { row: T }) => React.ReactNode
  enableSorting?: boolean
}

interface DataGridProps<T> {
  title?: string
  description?: string
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  exportable?: boolean
  columnToggle?: boolean
  pagination?: boolean
  pageSize?: number
  className?: string
}

export function DataGrid<T>({
  title,
  description,
  data,
  columns,
  searchable = true,
  exportable = true,
  columnToggle = true,
  pagination = true,
  pageSize = 10,
  className,
}: DataGridProps<T>) {
  const [sortBy, setSortBy] = useState<keyof T | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof T>>(
    new Set(columns.map(col => col.accessorKey))
  )

  // Handle column sorting
  const handleSort = (column: Column<T>) => {
    if (!column.enableSorting) return
    
    if (sortBy === column.accessorKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column.accessorKey)
      setSortDirection('asc')
    }
  }

  // Handle column visibility toggle
  const toggleColumnVisibility = (column: keyof T) => {
    const newVisibleColumns = new Set(visibleColumns)
    if (newVisibleColumns.has(column)) {
      newVisibleColumns.delete(column)
    } else {
      newVisibleColumns.add(column)
    }
    setVisibleColumns(newVisibleColumns)
  }

  // Filter and sort data
  let filteredData = [...data]
  
  // Apply search if enabled
  if (searchable && searchQuery) {
    const query = searchQuery.toLowerCase()
    filteredData = filteredData.filter(item => {
      return columns.some(column => {
        const value = item[column.accessorKey]
        return value !== null && 
               value !== undefined && 
               String(value).toLowerCase().includes(query)
      })
    })
  }
  
  // Apply sorting if a sort column is selected
  if (sortBy) {
    filteredData.sort((a, b) => {
      const valueA = a[sortBy]
      const valueB = b[sortBy]
      
      if (valueA === valueB) return 0
      
      // Handle different value types
      const result = (() => {
        if (valueA === null || valueA === undefined) return -1
        if (valueB === null || valueB === undefined) return 1
        
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          return valueA.localeCompare(valueB)
        }
        
        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return valueA - valueB
        }
        
        if (valueA instanceof Date && valueB instanceof Date) {
          return valueA.getTime() - valueB.getTime()
        }
        
        return String(valueA).localeCompare(String(valueB))
      })()
      
      return sortDirection === 'asc' ? result : -result
    })
  }
  
  // Apply pagination if enabled
  const totalPages = pagination ? Math.ceil(filteredData.length / pageSize) : 1
  const paginatedData = pagination 
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData

  // Export data to CSV
  const exportToCSV = () => {
    const visibleColumnsArray = Array.from(visibleColumns)
    const columnHeaders = columns
      .filter(col => visibleColumns.has(col.accessorKey))
      .map(col => col.header)
    
    const rows = filteredData.map(item => 
      visibleColumnsArray
        .map(key => String(item[key] ?? ''))
        .join(',')
    )
    
    const csv = [columnHeaders.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    
    link.setAttribute('href', url)
    link.setAttribute('download', `${title || 'data'}_export.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Card className={className}>
      {(title || description || searchable || columnToggle || exportable) && (
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                {title && <CardTitle>{title}</CardTitle>}
                {description && <CardDescription>{description}</CardDescription>}
              </div>
              <div className="flex items-center gap-2">
                {columnToggle && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Columns
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {columns.map(column => (
                        <DropdownMenuCheckboxItem
                          key={String(column.accessorKey)}
                          checked={visibleColumns.has(column.accessorKey)}
                          onCheckedChange={() => toggleColumnVisibility(column.accessorKey)}
                        >
                          {column.header}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {exportable && (
                  <Button variant="outline" size="sm" onClick={exportToCSV}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                )}
              </div>
            </div>
            
            {searchable && (
              <div>
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1) // Reset to first page on search
                  }}
                  className="max-w-sm"
                />
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, i) => {
                  if (!visibleColumns.has(column.accessorKey)) return null
                  
                  return (
                    <TableHead key={i}>
                      <div
                        className={`flex items-center ${column.enableSorting ? 'cursor-pointer' : ''}`}
                        onClick={() => column.enableSorting && handleSort(column)}
                      >
                        {column.header}
                        {column.enableSorting && sortBy === column.accessorKey ? (
                          sortDirection === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          )
                        ) : column.enableSorting ? (
                          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-30" />
                        ) : null}
                      </div>
                    </TableHead>
                  )
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    No results found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {columns.map((column, colIndex) => {
                      if (!visibleColumns.has(column.accessorKey)) return null
                      
                      return (
                        <TableCell key={colIndex}>
                          {column.cell
                            ? column.cell({ row })
                            : String(row[column.accessorKey] ?? '')}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {paginatedData.length} of {filteredData.length} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page => Math.min(page + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

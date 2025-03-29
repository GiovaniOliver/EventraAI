'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Check, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandInput,
} from '@/components/ui/command'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'

// Define filter types
export type EventStatusType = 
  | 'all'
  | 'draft'
  | 'planning'
  | 'confirmed'
  | 'completed'
  | 'cancelled'

export type EventTypeFilter = 
  | 'all'
  | 'wedding'
  | 'corporate'
  | 'social'
  | 'conference'
  | 'party'
  | 'other'

export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'title_asc'
  | 'title_desc'
  | 'upcoming'
  | 'budget_high'
  | 'budget_low'
  | 'guests_high'
  | 'guests_low'

export interface EventFiltersProps {
  className?: string
  initialStatus?: EventStatusType
  initialType?: EventTypeFilter
  initialSort?: SortOption
  onFiltersChange?: (filters: {
    search?: string
    status?: EventStatusType
    type?: EventTypeFilter
    sort?: SortOption
  }) => void
  allowUrlParams?: boolean
}

export function EventFilters({
  className,
  initialStatus = 'all',
  initialType = 'all',
  initialSort = 'newest',
  onFiltersChange,
  allowUrlParams = true,
}: EventFiltersProps) {
  // URL handling
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  // Get initial values from URL if allowed
  const getInitialValue = (param: string, defaultValue: string): string => {
    return allowUrlParams && searchParams.has(param)
      ? searchParams.get(param) || defaultValue
      : defaultValue
  }
  
  // State for filters
  const [search, setSearch] = useState(getInitialValue('search', ''))
  const [status, setStatus] = useState<EventStatusType>(
    getInitialValue('status', initialStatus) as EventStatusType
  )
  const [type, setType] = useState<EventTypeFilter>(
    getInitialValue('type', initialType) as EventTypeFilter
  )
  const [sort, setSort] = useState<SortOption>(
    getInitialValue('sort', initialSort) as SortOption
  )
  const [openFilters, setOpenFilters] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  
  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'planning', label: 'Planning' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ]
  
  // Type options
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'social', label: 'Social' },
    { value: 'conference', label: 'Conference' },
    { value: 'party', label: 'Party' },
    { value: 'other', label: 'Other' },
  ]
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'title_asc', label: 'Name (A-Z)' },
    { value: 'title_desc', label: 'Name (Z-A)' },
    { value: 'upcoming', label: 'Upcoming Events' },
    { value: 'budget_high', label: 'Budget (High to Low)' },
    { value: 'budget_low', label: 'Budget (Low to High)' },
    { value: 'guests_high', label: 'Guests (High to Low)' },
    { value: 'guests_low', label: 'Guests (Low to High)' },
  ]
  
  // Update URL parameters
  const updateUrlParams = () => {
    if (!allowUrlParams) return
    
    const params = new URLSearchParams(searchParams.toString())
    
    // Set parameters
    if (search) params.set('search', search)
    else params.delete('search')
    
    if (status !== 'all') params.set('status', status)
    else params.delete('status')
    
    if (type !== 'all') params.set('type', type)
    else params.delete('type')
    
    if (sort !== 'newest') params.set('sort', sort)
    else params.delete('sort')
    
    // Update URL
    router.push(`${pathname}?${params.toString()}`)
  }
  
  // Trigger filter changes
  useEffect(() => {
    // Notify parent component
    onFiltersChange?.({
      search: search || undefined,
      status: status === 'all' ? undefined : status,
      type: type === 'all' ? undefined : type,
      sort,
    })
    
    // Update URL
    updateUrlParams()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, type, sort])
  
  // Reset filters
  const handleReset = () => {
    setSearch('')
    setStatus('all')
    setType('all')
    setSort('newest')
  }
  
  // Count active filters
  const activeFilterCount = [
    search ? 1 : 0,
    status !== 'all' ? 1 : 0,
    type !== 'all' ? 1 : 0,
    sort !== 'newest' ? 1 : 0,
  ].reduce((a, b) => a + b, 0)
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Desktop filters */}
      <div className="hidden items-end gap-4 md:flex">
        {/* Search input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        {/* Status filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[120px] justify-start gap-2">
              {status !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="rounded-sm px-1 font-normal"
                >
                  {status}
                </Badge>
              )}
              Status
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {statusOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => setStatus(option.value as EventStatusType)}
                    >
                      {status === option.value && (
                        <Check className="mr-2 h-4 w-4 text-primary" />
                      )}
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Type filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[120px] justify-start gap-2">
              {type !== 'all' && (
                <Badge 
                  variant="secondary" 
                  className="rounded-sm px-1 font-normal"
                >
                  {type}
                </Badge>
              )}
              Event Type
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandList>
                <CommandGroup>
                  {typeOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => setType(option.value as EventTypeFilter)}
                    >
                      {type === option.value && (
                        <Check className="mr-2 h-4 w-4 text-primary" />
                      )}
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Sort filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="min-w-[120px] justify-start gap-2">
              Sort
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search sort options..." />
              <CommandList>
                <CommandGroup>
                  {sortOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => setSort(option.value as SortOption)}
                    >
                      {sort === option.value && (
                        <Check className="mr-2 h-4 w-4 text-primary" />
                      )}
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
        {/* Reset filters */}
        {activeFilterCount > 0 && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleReset}
            className="h-10"
          >
            <X className="mr-2 h-4 w-4" />
            Reset ({activeFilterCount})
          </Button>
        )}
      </div>
      
      {/* Mobile filters */}
      <div className="md:hidden">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => setShowMobileFilters(!showMobileFilters)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 rounded-full px-1 text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
        
        {showMobileFilters && (
          <div className="mt-4 rounded-md border p-4">
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="status" className="border-none">
                <AccordionTrigger className="py-1">
                  Status
                  {status !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {status}
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {statusOptions.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            status === option.value
                              ? "font-medium text-primary"
                              : "text-muted-foreground"
                          )}
                          onClick={() => setStatus(option.value as EventStatusType)}
                        >
                          {status === option.value && (
                            <Check className="mr-2 h-4 w-4 text-primary" />
                          )}
                          {option.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="type" className="border-none">
                <AccordionTrigger className="py-1">
                  Event Type
                  {type !== 'all' && (
                    <Badge variant="secondary" className="ml-2">
                      {type}
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {typeOptions.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            type === option.value
                              ? "font-medium text-primary"
                              : "text-muted-foreground"
                          )}
                          onClick={() => setType(option.value as EventTypeFilter)}
                        >
                          {type === option.value && (
                            <Check className="mr-2 h-4 w-4 text-primary" />
                          )}
                          {option.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="sort" className="border-none">
                <AccordionTrigger className="py-1">
                  Sort By
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-1">
                    {sortOptions.map((option) => (
                      <div key={option.value} className="flex items-center">
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start",
                            sort === option.value
                              ? "font-medium text-primary"
                              : "text-muted-foreground"
                          )}
                          onClick={() => setSort(option.value as SortOption)}
                        >
                          {sort === option.value && (
                            <Check className="mr-2 h-4 w-4 text-primary" />
                          )}
                          {option.label}
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="mt-4 w-full"
              >
                <X className="mr-2 h-4 w-4" />
                Reset all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

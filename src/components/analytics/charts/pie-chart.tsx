'use client'

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DataPoint {
  name: string
  value: number
}

interface PieChartProps {
  title: string
  description?: string
  data: DataPoint[]
  colors?: string[]
  className?: string
  nameKey?: string
  dataKey?: string
  innerRadius?: number
  outerRadius?: number
  legendPosition?: 'top' | 'right' | 'bottom' | 'left'
}

const DEFAULT_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
  '#8B5CF6', '#EC4899', '#6366F1', '#D946EF'
];

export function PieChart({
  title,
  description,
  data,
  colors = DEFAULT_COLORS,
  className,
  nameKey = 'name',
  dataKey = 'value',
  innerRadius = 0,
  outerRadius = 80,
  legendPosition = 'bottom'
}: PieChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                fill="#8884d8"
                dataKey={dataKey}
                nameKey={nameKey}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend layout={legendPosition === 'left' || legendPosition === 'right' ? 'vertical' : 'horizontal'} 
                      align={legendPosition === 'left' ? 'left' : legendPosition === 'right' ? 'right' : 'center'} 
                      verticalAlign={legendPosition === 'top' ? 'top' : legendPosition === 'bottom' ? 'bottom' : 'middle'} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

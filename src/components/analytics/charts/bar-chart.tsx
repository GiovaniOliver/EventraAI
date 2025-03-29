'use client'

import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  TooltipProps
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface DataPoint {
  [key: string]: string | number
}

interface BarChartProps {
  title: string
  description?: string
  data: DataPoint[]
  categories: Array<{
    name: string
    dataKey: string
    color: string
  }>
  indexKey: string
  className?: string
}

export function BarChart({
  title,
  description,
  data,
  categories,
  indexKey,
  className
}: BarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={indexKey} />
              <YAxis />
              <Tooltip />
              <Legend />
              {categories.map((category) => (
                <Bar
                  key={category.dataKey}
                  dataKey={category.dataKey}
                  name={category.name}
                  fill={category.color}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerClient()
  
  try {
    // Ping the Supabase connection to verify it's working
    const { data, error } = await supabase.from('users').select('count', { count: 'exact' }).limit(1)
    
    if (error) {
      throw error
    }
    
    return NextResponse.json({ 
      status: "ok", 
      message: "Server is running with Supabase",
      timestamp: new Date().toISOString(),
      supabase: "connected",
      environment: process.env.NODE_ENV || 'development'
    }, { status: 200 })
  } catch (error) {
    console.error('Health check error:', error)
    
    return NextResponse.json({ 
      status: "error", 
      message: "Server is running but Supabase connection failed",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, { status: 500 })
  }
} 
'use client'

import { useState } from 'react'
import { X, Save, Upload, User } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'

export interface ProfileData {
  id: string
  name: string
  email: string
  company?: string
  jobTitle?: string
  bio?: string
  avatarUrl?: string
}

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: ProfileData
  onSave: (data: ProfileData) => Promise<void>
}

export function ProfileModal({
  isOpen,
  onClose,
  profile,
  onSave,
}: ProfileModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<ProfileData>({...profile})
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await onSave(formData)
      
      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved successfully.',
      })
      
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      
      toast({
        title: 'Error',
        description: 'There was a problem updating your profile. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Handle avatar upload
  const handleAvatarUpload = () => {
    // Upload functionality would be implemented here
    toast({
      title: 'Avatar upload',
      description: 'This functionality will be implemented soon.',
    })
  }
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your personal information and how you appear in the platform.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar upload section */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={formData.avatarUrl} alt={formData.name} />
              <AvatarFallback className="text-lg">
                {getInitials(formData.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit"
                onClick={handleAvatarUpload}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload avatar
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max 2MB.
              </p>
            </div>
          </div>
          
          {/* Name field */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Email field */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Company and Job Title fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input 
                id="company"
                name="company"
                value={formData.company || ''}
                onChange={handleChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input 
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle || ''}
                onChange={handleChange}
              />
            </div>
          </div>
          
          {/* Bio field */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleChange}
              className="resize-none"
              rows={3}
              maxLength={160}
            />
            <p className="text-xs text-muted-foreground">
              {(formData.bio?.length || 0)}/160 characters
            </p>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>Processing...</>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

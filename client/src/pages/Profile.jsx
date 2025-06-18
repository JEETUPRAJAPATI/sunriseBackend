import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  Building,
  Shield,
  Calendar,
  Settings,
  Lock,
  Activity,
  Clock
} from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    unit: user?.unit || ''
  });

  const handleSave = () => {
    // Here you would typically make an API call to update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been updated successfully.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      unit: user?.unit || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Profile</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your account settings and preferences</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {/* Profile Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-bold">
                {user?.fullName 
                  ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)
                  : user?.username?.slice(0, 2).toUpperCase() || 'U'
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{user?.fullName || user?.username}</CardTitle>
              <CardDescription className="text-lg">
                <Badge variant="secondary" className="mr-2">{user?.role}</Badge>
                {user?.unit}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Update your personal details and contact information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex space-x-2 pt-4">
                  <Button onClick={handleSave}>Save Changes</Button>
                  <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role and Permissions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Role & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Role</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Your access level in the system</p>
                  </div>
                  <Badge variant="default">{user?.role}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Unit Assignment</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Your organizational unit</p>
                  </div>
                  <span className="text-sm font-medium">{user?.unit || 'System Wide'}</span>
                </div>
                <div>
                  <p className="font-medium mb-2">Module Access</p>
                  <div className="flex flex-wrap gap-2">
                    {user?.profile?.modules?.map((module) => (
                      <Badge key={module} variant="outline" className="text-xs">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="w-5 h-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security and password.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Last updated 30 days ago</p>
                </div>
                <Button variant="outline">Change Password</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Login Sessions</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Manage your active sessions</p>
                </div>
                <Button variant="outline">View Sessions</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity */}
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your recent actions and system usage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Logged in</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Today at 9:00 AM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <User className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Profile updated</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Yesterday at 3:30 PM</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <Settings className="w-4 h-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Settings modified</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">2 days ago at 11:15 AM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
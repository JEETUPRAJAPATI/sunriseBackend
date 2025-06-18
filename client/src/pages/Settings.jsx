import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { Settings as SettingsIcon, Save, Building, Globe, Mail, Shield } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    enabled: true
  });

  const updateSettingsMutation = useMutation({
    mutationFn: ({ endpoint, data }) => api.put(endpoint, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const [companyData, setCompanyData] = useState({
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    contact: {
      phone: '',
      email: '',
      website: ''
    },
    gstNumber: '',
    panNumber: ''
  });

  const [systemData, setSystemData] = useState({
    currency: 'USD',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12',
    language: 'en'
  });

  const [emailData, setEmailData] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: ''
  });

  const [moduleSettings, setModuleSettings] = useState({
    dashboard: true,
    orders: true,
    manufacturing: true,
    dispatches: true,
    sales: true,
    accounts: true,
    inventory: true,
    customers: true,
    suppliers: true,
    purchases: true
  });

  const [notificationSettings, setNotificationSettings] = useState({
    lowStock: true,
    orderDelay: true,
    paymentDue: true,
    productionAlert: true
  });

  // Update state when data loads
  useState(() => {
    if (settingsData?.settings) {
      const settings = settingsData.settings;
      setCompanyData(settings.company || companyData);
      setSystemData(settings.system || systemData);
      setEmailData(settings.email || emailData);
      setModuleSettings(settings.modules || moduleSettings);
      setNotificationSettings(settings.notifications || notificationSettings);
    }
  }, [settingsData]);

  const handleCompanyUpdate = () => {
    updateSettingsMutation.mutate({
      endpoint: '/api/settings/company',
      data: companyData
    });
  };

  const handleSystemUpdate = () => {
    updateSettingsMutation.mutate({
      endpoint: '/api/settings/system',
      data: systemData
    });
  };

  const handleEmailUpdate = () => {
    updateSettingsMutation.mutate({
      endpoint: '/api/settings/email',
      data: emailData
    });
  };

  const handleModuleUpdate = () => {
    updateSettingsMutation.mutate({
      endpoint: '/api/settings/modules',
      data: moduleSettings
    });
  };

  const handleNotificationUpdate = () => {
    updateSettingsMutation.mutate({
      endpoint: '/api/settings/notifications',
      data: notificationSettings
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-semibold">Settings</h1>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-muted rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-semibold">Settings</h1>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Company Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyData.name}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={companyData.gstNumber}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      gstNumber: e.target.value
                    }))}
                    placeholder="Enter GST number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="street">Street Address</Label>
                <Input
                  id="street"
                  value={companyData.address.street}
                  onChange={(e) => setCompanyData(prev => ({
                    ...prev,
                    address: { ...prev.address, street: e.target.value }
                  }))}
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={companyData.address.city}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={companyData.address.state}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  <Input
                    id="zipCode"
                    value={companyData.address.zipCode}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: e.target.value }
                    }))}
                    placeholder="Enter zip code"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={companyData.contact.phone}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, phone: e.target.value }
                    }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companyData.contact.email}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, email: e.target.value }
                    }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={companyData.contact.website}
                    onChange={(e) => setCompanyData(prev => ({
                      ...prev,
                      contact: { ...prev.contact, website: e.target.value }
                    }))}
                    placeholder="Enter website URL"
                  />
                </div>
              </div>

              <Button onClick={handleCompanyUpdate} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Company Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={systemData.currency} onValueChange={(value) => 
                    setSystemData(prev => ({ ...prev, currency: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={systemData.timezone} onValueChange={(value) => 
                    setSystemData(prev => ({ ...prev, timezone: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Asia/Kolkata">India Standard Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select value={systemData.dateFormat} onValueChange={(value) => 
                    setSystemData(prev => ({ ...prev, dateFormat: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select value={systemData.timeFormat} onValueChange={(value) => 
                    setSystemData(prev => ({ ...prev, timeFormat: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 Hour</SelectItem>
                      <SelectItem value="24">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSystemUpdate} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save System Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Email Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={emailData.smtpHost}
                    onChange={(e) => setEmailData(prev => ({
                      ...prev,
                      smtpHost: e.target.value
                    }))}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    value={emailData.smtpPort}
                    onChange={(e) => setEmailData(prev => ({
                      ...prev,
                      smtpPort: parseInt(e.target.value)
                    }))}
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={emailData.smtpUser}
                    onChange={(e) => setEmailData(prev => ({
                      ...prev,
                      smtpUser: e.target.value
                    }))}
                    placeholder="username@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={emailData.smtpPassword}
                    onChange={(e) => setEmailData(prev => ({
                      ...prev,
                      smtpPassword: e.target.value
                    }))}
                    placeholder="Enter password"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={emailData.fromEmail}
                    onChange={(e) => setEmailData(prev => ({
                      ...prev,
                      fromEmail: e.target.value
                    }))}
                    placeholder="noreply@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={emailData.fromName}
                    onChange={(e) => setEmailData(prev => ({
                      ...prev,
                      fromName: e.target.value
                    }))}
                    placeholder="Company Name"
                  />
                </div>
              </div>

              <Button onClick={handleEmailUpdate} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Email Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modules">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Module Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(moduleSettings).map(([module, enabled]) => (
                  <div key={module} className="flex items-center justify-between">
                    <Label htmlFor={module} className="capitalize">
                      {module}
                    </Label>
                    <Switch
                      id={module}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setModuleSettings(prev => ({ ...prev, [module]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleModuleUpdate} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Module Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries(notificationSettings).map(([notification, enabled]) => (
                  <div key={notification} className="flex items-center justify-between">
                    <div>
                      <Label htmlFor={notification} className="capitalize">
                        {notification.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {notification === 'lowStock' && 'Receive alerts when inventory is low'}
                        {notification === 'orderDelay' && 'Get notified of delayed orders'}
                        {notification === 'paymentDue' && 'Receive payment due reminders'}
                        {notification === 'productionAlert' && 'Get production status alerts'}
                      </p>
                    </div>
                    <Switch
                      id={notification}
                      checked={enabled}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, [notification]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleNotificationUpdate} disabled={updateSettingsMutation.isPending}>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

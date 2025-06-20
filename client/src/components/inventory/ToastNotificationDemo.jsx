import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  showSmartToast, 
  showSuccessToast, 
  showWarningToast, 
  showInfoToast,
  showValidationToast,
  showBatchOperationToast,
  ERROR_CATEGORIES 
} from '@/lib/toast-utils';

// Demo component to showcase smart toast notifications
export default function ToastNotificationDemo() {
  const demoErrors = {
    validation: new Error('Validation failed'),
    network: { code: 'NETWORK_ERROR', message: 'Network connection failed' },
    auth: { response: { status: 401, data: { message: 'Unauthorized access' } } },
    permission: { response: { status: 403, data: { message: 'Access denied' } } },
    notFound: { response: { status: 404, data: { message: 'Resource not found' } } },
    conflict: { response: { status: 409, data: { message: 'Item already exists' } } },
    server: { response: { status: 500, data: { message: 'Internal server error' } } },
    validationFields: { 
      response: { 
        status: 400, 
        data: { 
          message: 'Validation failed',
          errors: {
            name: 'Name is required',
            email: 'Invalid email format',
            password: 'Password must be at least 8 characters'
          }
        }
      }
    }
  };

  const handleDemoToast = (type) => {
    switch (type) {
      case 'success':
        showSuccessToast('Operation Successful', 'Your item has been created successfully');
        break;
      case 'warning':
        showWarningToast('Low Stock Alert', 'Some items are running low on stock');
        break;
      case 'info':
        showInfoToast('System Update', 'A new version is available for download');
        break;
      case 'validation':
        showValidationToast({
          name: 'Name is required',
          category: 'Please select a category',
          price: 'Price must be greater than 0'
        }, 'Product Form');
        break;
      case 'batch':
        showBatchOperationToast({ success: 8, failed: 2, total: 10 });
        break;
      default:
        if (demoErrors[type]) {
          showSmartToast(demoErrors[type], 'Demo Context');
        }
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Smart Toast Notifications Demo</CardTitle>
        <CardDescription>
          Test the intelligent error categorization and notification system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success & Info Toasts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Standard Notifications</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleDemoToast('success')} variant="default">
              Success Toast
            </Button>
            <Button onClick={() => handleDemoToast('warning')} variant="secondary">
              Warning Toast
            </Button>
            <Button onClick={() => handleDemoToast('info')} variant="outline">
              Info Toast
            </Button>
          </div>
        </div>

        {/* Error Category Toasts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Smart Error Categories</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button 
              onClick={() => handleDemoToast('network')} 
              variant="destructive"
              size="sm"
            >
              <Badge variant="destructive" className="mr-2">Network</Badge>
              Connection Error
            </Button>
            <Button 
              onClick={() => handleDemoToast('auth')} 
              variant="destructive"
              size="sm"
            >
              <Badge variant="destructive" className="mr-2">Auth</Badge>
              Unauthorized
            </Button>
            <Button 
              onClick={() => handleDemoToast('permission')} 
              variant="destructive"
              size="sm"
            >
              <Badge variant="secondary" className="mr-2">Access</Badge>
              Permission Denied
            </Button>
            <Button 
              onClick={() => handleDemoToast('notFound')} 
              variant="destructive"
              size="sm"
            >
              <Badge variant="outline" className="mr-2">404</Badge>
              Not Found
            </Button>
            <Button 
              onClick={() => handleDemoToast('conflict')} 
              variant="destructive"
              size="sm"
            >
              <Badge variant="secondary" className="mr-2">Conflict</Badge>
              Duplicate Data
            </Button>
            <Button 
              onClick={() => handleDemoToast('server')} 
              variant="destructive"
              size="sm"
            >
              <Badge variant="destructive" className="mr-2">Server</Badge>
              Internal Error
            </Button>
            <Button 
              onClick={() => handleDemoToast('validationFields')} 
              variant="destructive"
              size="sm"
            >
              <Badge variant="outline" className="mr-2">Validation</Badge>
              Field Errors
            </Button>
          </div>
        </div>

        {/* Special Toasts */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Special Notifications</h3>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleDemoToast('validation')} variant="outline">
              Validation Summary
            </Button>
            <Button onClick={() => handleDemoToast('batch')} variant="outline">
              Batch Operation
            </Button>
          </div>
        </div>

        {/* Feature List */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Smart Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">✨</Badge>
                <span>Automatic error categorization</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">🎯</Badge>
                <span>Context-aware messages</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">⏱️</Badge>
                <span>Severity-based duration</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">🎨</Badge>
                <span>Visual error indicators</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline">🔧</Badge>
                <span>Actionable error buttons</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">📊</Badge>
                <span>Batch operation summaries</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">🌐</Badge>
                <span>Network status monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">📝</Badge>
                <span>Validation field highlighting</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
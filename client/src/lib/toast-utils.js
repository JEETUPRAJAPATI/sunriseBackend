import { toast } from '@/hooks/use-toast';

// Error categories for smart notifications
export const ERROR_CATEGORIES = {
  VALIDATION: 'validation',
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  PERMISSION: 'permission',
  SERVER: 'server',
  CONFLICT: 'conflict',
  NOT_FOUND: 'not_found',
  BUSINESS_LOGIC: 'business_logic'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Smart error categorization based on status codes and messages
export const categorizeError = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message?.toLowerCase() || error.message?.toLowerCase() || '';
  const errors = error.response?.data?.errors;

  // Network errors
  if (!status || status === 0 || error.code === 'NETWORK_ERROR') {
    return {
      category: ERROR_CATEGORIES.NETWORK,
      severity: ERROR_SEVERITY.HIGH,
      title: 'Connection Problem',
      description: 'Unable to connect to the server. Please check your internet connection.',
      action: 'Retry',
      icon: '🌐'
    };
  }

  // Authentication errors
  if (status === 401) {
    return {
      category: ERROR_CATEGORIES.AUTHENTICATION,
      severity: ERROR_SEVERITY.HIGH,
      title: 'Authentication Required',
      description: 'Your session has expired. Please log in again.',
      action: 'Login',
      icon: '🔐'
    };
  }

  // Permission errors
  if (status === 403) {
    return {
      category: ERROR_CATEGORIES.PERMISSION,
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'Access Denied',
      description: 'You don\'t have permission to perform this action.',
      action: 'Contact Admin',
      icon: '🚫'
    };
  }

  // Not found errors
  if (status === 404) {
    return {
      category: ERROR_CATEGORIES.NOT_FOUND,
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'Resource Not Found',
      description: 'The requested item could not be found.',
      action: 'Refresh',
      icon: '❓'
    };
  }

  // Validation errors
  if (status === 400 && (errors || message.includes('validation') || message.includes('required'))) {
    const errorCount = errors ? Object.keys(errors).length : 0;
    return {
      category: ERROR_CATEGORIES.VALIDATION,
      severity: ERROR_SEVERITY.LOW,
      title: 'Validation Error',
      description: errorCount > 0 
        ? `Please fix ${errorCount} field${errorCount > 1 ? 's' : ''}`
        : 'Please check your input and try again.',
      action: 'Fix Fields',
      icon: '⚠️',
      details: errors
    };
  }

  // Conflict errors (duplicate data, etc.)
  if (status === 409 || message.includes('already exists') || message.includes('duplicate')) {
    return {
      category: ERROR_CATEGORIES.CONFLICT,
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'Data Conflict',
      description: 'This item already exists or conflicts with existing data.',
      action: 'Modify',
      icon: '⚡'
    };
  }

  // Business logic errors
  if (status === 422) {
    return {
      category: ERROR_CATEGORIES.BUSINESS_LOGIC,
      severity: ERROR_SEVERITY.MEDIUM,
      title: 'Business Rule Violation',
      description: 'This action violates business rules or constraints.',
      action: 'Review',
      icon: '📋'
    };
  }

  // Server errors
  if (status >= 500) {
    return {
      category: ERROR_CATEGORIES.SERVER,
      severity: ERROR_SEVERITY.HIGH,
      title: 'Server Error',
      description: 'An unexpected server error occurred. Our team has been notified.',
      action: 'Try Again',
      icon: '🔧'
    };
  }

  // Default fallback
  return {
    category: ERROR_CATEGORIES.SERVER,
    severity: ERROR_SEVERITY.MEDIUM,
    title: 'Unexpected Error',
    description: message || 'An unexpected error occurred.',
    action: 'Retry',
    icon: '❌'
  };
};

// Smart toast notification with error categorization
export const showSmartToast = (error, context = '') => {
  const errorInfo = categorizeError(error);
  
  // Customize description based on context
  let description = errorInfo.description;
  if (context) {
    description = `${context}: ${description}`;
  }

  // Show toast with appropriate styling based on severity
  const variant = errorInfo.severity === ERROR_SEVERITY.HIGH || errorInfo.severity === ERROR_SEVERITY.CRITICAL 
    ? 'destructive' 
    : 'default';

  toast({
    title: `${errorInfo.icon} ${errorInfo.title}`,
    description,
    variant,
    duration: getDurationBySeverity(errorInfo.severity),
    action: errorInfo.action ? (
      <button
        onClick={() => handleErrorAction(errorInfo)}
        className="inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {errorInfo.action}
      </button>
    ) : undefined
  });

  // Log error for debugging
  console.error(`[${errorInfo.category.toUpperCase()}] ${errorInfo.title}:`, error);

  return errorInfo;
};

// Get toast duration based on severity
const getDurationBySeverity = (severity) => {
  switch (severity) {
    case ERROR_SEVERITY.LOW:
      return 3000;
    case ERROR_SEVERITY.MEDIUM:
      return 5000;
    case ERROR_SEVERITY.HIGH:
      return 8000;
    case ERROR_SEVERITY.CRITICAL:
      return 0; // Manual dismiss
    default:
      return 5000;
  }
};

// Handle error actions
const handleErrorAction = (errorInfo) => {
  switch (errorInfo.action) {
    case 'Retry':
      window.location.reload();
      break;
    case 'Login':
      // Redirect to login or trigger login modal
      window.location.href = '/login';
      break;
    case 'Refresh':
      window.location.reload();
      break;
    case 'Contact Admin':
      // Open support modal or redirect to contact page
      console.log('Contact admin action triggered');
      break;
    default:
      console.log(`Action triggered: ${errorInfo.action}`);
  }
};

// Success toast variants
export const showSuccessToast = (title, description, options = {}) => {
  toast({
    title: `✅ ${title}`,
    description,
    variant: 'default',
    duration: options.duration || 3000,
    className: 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
  });
};

// Warning toast
export const showWarningToast = (title, description, options = {}) => {
  toast({
    title: `⚠️ ${title}`,
    description,
    variant: 'default',
    duration: options.duration || 4000,
    className: 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200'
  });
};

// Info toast
export const showInfoToast = (title, description, options = {}) => {
  toast({
    title: `ℹ️ ${title}`,
    description,
    variant: 'default',
    duration: options.duration || 4000,
    className: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
  });
};

// Loading toast with progress
export const showLoadingToast = (title, description) => {
  return toast({
    title: `⏳ ${title}`,
    description,
    duration: 0, // Manual dismiss
    className: 'border-gray-500 bg-gray-50 dark:bg-gray-900/20'
  });
};

// Validation specific toast
export const showValidationToast = (errors, formName = 'form') => {
  if (!errors || typeof errors !== 'object') return;

  const errorFields = Object.keys(errors);
  const errorCount = errorFields.length;
  
  if (errorCount === 0) return;

  const title = `Validation Failed`;
  const description = errorCount === 1 
    ? `Please fix the error in ${errorFields[0]}`
    : `Please fix ${errorCount} errors in: ${errorFields.join(', ')}`;

  toast({
    title: `⚠️ ${title}`,
    description,
    variant: 'destructive',
    duration: 6000,
    action: {
      altText: 'Fix Fields',
      label: 'Fix Fields',
      onClick: () => {
        // Scroll to first error field
        const firstField = errorFields[0];
        const element = document.querySelector(`[name="${firstField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
    }
  });
};

// Network status toast
export const showNetworkStatusToast = (isOnline) => {
  if (isOnline) {
    showSuccessToast('Connection Restored', 'You are back online');
  } else {
    toast({
      title: '🔌 Connection Lost',
      description: 'You are currently offline. Some features may not work.',
      variant: 'destructive',
      duration: 0 // Keep until online
    });
  }
};

// Batch operation toast
export const showBatchOperationToast = (results) => {
  const { success = 0, failed = 0, total = 0 } = results;
  
  if (failed === 0) {
    showSuccessToast(
      'Batch Operation Complete',
      `Successfully processed ${success} of ${total} items`
    );
  } else if (success === 0) {
    showSmartToast(
      new Error(`All ${total} operations failed`),
      'Batch Operation'
    );
  } else {
    showWarningToast(
      'Batch Operation Partial Success',
      `${success} succeeded, ${failed} failed out of ${total} items`
    );
  }
};

export default {
  showSmartToast,
  showSuccessToast,
  showWarningToast,
  showInfoToast,
  showLoadingToast,
  showValidationToast,
  showNetworkStatusToast,
  showBatchOperationToast,
  categorizeError,
  ERROR_CATEGORIES,
  ERROR_SEVERITY
};
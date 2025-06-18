import Settings from '../models/Settings.js';
import { USER_ROLES } from '../../shared/schema.js';

export const getSettings = async (req, res) => {
  try {
    // Only super users can access settings
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied. Only super users can access settings.' });
    }

    const settings = await Settings.getSettings();
    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    // Only super users can update settings
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied. Only super users can update settings.' });
    }

    const updateData = req.body;
    
    // Get existing settings
    let settings = await Settings.getSettings();
    
    // Update the settings
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        settings[key] = updateData[key];
      }
    });

    await settings.save();

    res.json({
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateCompanySettings = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, address, contact, gstNumber, panNumber } = req.body;

    const settings = await Settings.getSettings();
    
    if (name) settings.company.name = name;
    if (address) settings.company.address = { ...settings.company.address, ...address };
    if (contact) settings.company.contact = { ...settings.company.contact, ...contact };
    if (gstNumber !== undefined) settings.company.gstNumber = gstNumber;
    if (panNumber !== undefined) settings.company.panNumber = panNumber;

    await settings.save();

    res.json({
      message: 'Company settings updated successfully',
      company: settings.company
    });
  } catch (error) {
    console.error('Update company settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSystemSettings = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { currency, timezone, dateFormat, timeFormat, language } = req.body;

    const settings = await Settings.getSettings();
    
    if (currency) settings.system.currency = currency;
    if (timezone) settings.system.timezone = timezone;
    if (dateFormat) settings.system.dateFormat = dateFormat;
    if (timeFormat) settings.system.timeFormat = timeFormat;
    if (language) settings.system.language = language;

    await settings.save();

    res.json({
      message: 'System settings updated successfully',
      system: settings.system
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateEmailSettings = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { smtpHost, smtpPort, smtpUser, smtpPassword, fromEmail, fromName } = req.body;

    const settings = await Settings.getSettings();
    
    if (smtpHost) settings.email.smtpHost = smtpHost;
    if (smtpPort) settings.email.smtpPort = smtpPort;
    if (smtpUser) settings.email.smtpUser = smtpUser;
    if (smtpPassword) settings.email.smtpPassword = smtpPassword;
    if (fromEmail) settings.email.fromEmail = fromEmail;
    if (fromName) settings.email.fromName = fromName;

    await settings.save();

    res.json({
      message: 'Email settings updated successfully',
      email: {
        ...settings.email.toObject(),
        smtpPassword: '***' // Hide password in response
      }
    });
  } catch (error) {
    console.error('Update email settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateModuleSettings = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const moduleSettings = req.body;

    const settings = await Settings.getSettings();
    
    Object.keys(moduleSettings).forEach(module => {
      if (typeof moduleSettings[module] === 'boolean') {
        settings.modules[module] = moduleSettings[module];
      }
    });

    await settings.save();

    res.json({
      message: 'Module settings updated successfully',
      modules: settings.modules
    });
  } catch (error) {
    console.error('Update module settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateNotificationSettings = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const notificationSettings = req.body;

    const settings = await Settings.getSettings();
    
    Object.keys(notificationSettings).forEach(notification => {
      if (typeof notificationSettings[notification] === 'boolean') {
        settings.notifications[notification] = notificationSettings[notification];
      }
    });

    await settings.save();

    res.json({
      message: 'Notification settings updated successfully',
      notifications: settings.notifications
    });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBackupSettings = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { enabled, frequency, time } = req.body;

    const settings = await Settings.getSettings();
    
    if (typeof enabled === 'boolean') settings.backup.enabled = enabled;
    if (frequency) settings.backup.frequency = frequency;
    if (time) settings.backup.time = time;

    await settings.save();

    res.json({
      message: 'Backup settings updated successfully',
      backup: settings.backup
    });
  } catch (error) {
    console.error('Update backup settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateThemeSettings = async (req, res) => {
  try {
    if (req.user.role !== USER_ROLES.SUPER_USER) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { defaultTheme, allowUserThemeChange } = req.body;

    const settings = await Settings.getSettings();
    
    if (defaultTheme) settings.theme.defaultTheme = defaultTheme;
    if (typeof allowUserThemeChange === 'boolean') settings.theme.allowUserThemeChange = allowUserThemeChange;

    await settings.save();

    res.json({
      message: 'Theme settings updated successfully',
      theme: settings.theme
    });
  } catch (error) {
    console.error('Update theme settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

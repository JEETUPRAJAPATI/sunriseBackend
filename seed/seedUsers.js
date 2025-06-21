import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const createSeedUsers = async () => {
  try {
    console.log('Creating seed users...');
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    const users = [
      {
        username: 'admin',
        email: 'admin@company.com',
        password: await bcrypt.hash('admin123', 12),
        fullName: 'Admin User',
        role: 'Super User',
        unit: 'Unit A - Assembly',
        isActive: true,
        permissions: []
      },
      {
        username: 'unithead',
        email: 'unithead@company.com',
        password: await bcrypt.hash('unit123', 12),
        fullName: 'Unit Head',
        role: 'Unit Head',
        unit: 'Unit A - Assembly',
        isActive: true,
        permissions: []
      },
      {
        username: 'production',
        email: 'production@company.com',
        password: await bcrypt.hash('prod123', 12),
        fullName: 'Production Manager',
        role: 'Production',
        unit: 'Unit A - Assembly',
        isActive: true,
        permissions: []
      },
      {
        username: 'packing',
        email: 'packing@company.com',
        password: await bcrypt.hash('pack123', 12),
        fullName: 'Packing Supervisor',
        role: 'Packing',
        unit: 'Unit B - Packing',
        isActive: true,
        permissions: []
      },
      {
        username: 'dispatch',
        email: 'dispatch@company.com',
        password: await bcrypt.hash('disp123', 12),
        fullName: 'Dispatch Manager',
        role: 'Dispatch',
        unit: 'Unit C - Dispatch',
        isActive: true,
        permissions: []
      },
      {
        username: 'accounts',
        email: 'accounts@company.com',
        password: await bcrypt.hash('acc123', 12),
        fullName: 'Accounts Manager',
        role: 'Accounts',
        unit: 'Unit D - Finance',
        isActive: true,
        permissions: []
      }
    ];

    await User.insertMany(users);
    console.log(`Created ${users.length} seed users successfully!`);
    console.log('Login credentials:');
    console.log('Super User: admin / admin123');
    console.log('Unit Head: unithead / unit123');
    console.log('Production: production / prod123');
    console.log('Packing: packing / pack123');
    console.log('Dispatch: dispatch / disp123');
    console.log('Accounts: accounts / acc123');
  } catch (error) {
    console.error('Error creating seed users:', error);
  }
};

export default createSeedUsers;
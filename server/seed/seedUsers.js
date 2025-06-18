const bcrypt = require('bcryptjs');
const User = require('../models/User.js');

const seedUsers = [
  {
    username: 'admin',
    email: 'admin@company.com',
    password: 'admin123',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Super User',
    unit: 'Unit A - Assembly',
    isActive: true
  },
  {
    username: 'unithead',
    email: 'unithead@company.com',
    password: 'unit123',
    firstName: 'Unit',
    lastName: 'Head',
    role: 'Unit Head',
    unit: 'Unit A - Assembly',
    isActive: true
  },
  {
    username: 'production',
    email: 'production@company.com',
    password: 'prod123',
    firstName: 'Production',
    lastName: 'Manager',
    role: 'Production',
    unit: 'Unit A - Assembly',
    isActive: true
  },
  {
    username: 'packing',
    email: 'packing@company.com',
    password: 'pack123',
    firstName: 'Packing',
    lastName: 'Manager',
    role: 'Packing',
    unit: 'Unit B - Packaging',
    isActive: true
  },
  {
    username: 'dispatch',
    email: 'dispatch@company.com',
    password: 'disp123',
    firstName: 'Dispatch',
    lastName: 'Manager',
    role: 'Dispatch',
    unit: 'Unit D - Dispatch',
    isActive: true
  },
  {
    username: 'accounts',
    email: 'accounts@company.com',
    password: 'acc123',
    firstName: 'Accounts',
    lastName: 'Manager',
    role: 'Accounts',
    unit: 'Unit A - Assembly',
    isActive: true
  }
];

const createSeedUsers = async () => {
  try {
    console.log('Creating seed users...');
    
    for (const userData of seedUsers) {
      const existingUser = await User.findOne({ 
        $or: [
          { username: userData.username },
          { email: userData.email }
        ]
      });
      
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = new User({
          ...userData,
          password: hashedPassword
        });
        
        await user.save();
        console.log(`Created user: ${userData.username} (${userData.role})`);
      } else {
        console.log(`User already exists: ${userData.username}`);
      }
    }
    
    console.log('Seed users created successfully!');
    console.log('\nLogin credentials:');
    seedUsers.forEach(user => {
      console.log(`${user.role}: ${user.username} / ${user.password}`);
    });
    
  } catch (error) {
    console.error('Error creating seed users:', error);
  }
};

module.exports = createSeedUsers;
// setup-sample-data.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Venue = require('./models/Venue');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quickcourt';

// Sample users
const sampleUsers = [
  {
    username: 'admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    location: 'Ahmedabad',
    isEmailVerified: true
  },
  {
    username: 'manager1',
    email: 'manager1@example.com',
    password: 'password123',
    role: 'facility_manager',
    location: 'Ahmedabad',
    isEmailVerified: true
  },
  {
    username: 'manager2',
    email: 'manager2@example.com',
    password: 'password123',
    role: 'facility_manager',
    location: 'Vadodara',
    isEmailVerified: true
  },
  {
    username: 'player1',
    email: 'player1@example.com',
    password: 'password123',
    role: 'player',
    location: 'Ahmedabad',
    isEmailVerified: true
  }
];

// Sample venues
const sampleVenues = [
  {
    name: 'Sports Complex Ahmedabad',
    location: 'Ahmedabad',
    sport: 'Badminton',
    description: 'Premium badminton courts with AC and professional lighting',
    capacity: 20,
    amenities: ['AC', 'Parking', 'Changing Room', 'Water', 'Equipment Rental'],
    sportsSupported: ['Badminton', 'Table Tennis'],
    pricing: { hourlyRate: 600, currency: 'INR' },
    operatingHours: { open: '06:00', close: '22:00' },
    contactInfo: { phone: '+91-9876543210', email: 'contact@sportscomplex.com' },
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    isActive: true
  },
  {
    name: 'Elite Football Ground',
    location: 'Vadodara',
    sport: 'Football',
    description: 'Professional football ground with natural grass and floodlights',
    capacity: 50,
    amenities: ['Parking', 'Changing Room', 'Washroom', 'Water', 'First Aid'],
    sportsSupported: ['Football', 'Cricket'],
    pricing: { hourlyRate: 1200, currency: 'INR' },
    operatingHours: { open: '05:00', close: '23:00' },
    contactInfo: { phone: '+91-9876543211', email: 'elite@football.com' },
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=400&q=80',
    isActive: true
  },
  {
    name: 'Tennis Academy Surat',
    location: 'Surat',
    sport: 'Tennis',
    description: 'Professional tennis courts with synthetic surface',
    capacity: 12,
    amenities: ['AC', 'Parking', 'Changing Room', 'Equipment Rental', 'Cafeteria'],
    sportsSupported: ['Tennis'],
    pricing: { hourlyRate: 800, currency: 'INR' },
    operatingHours: { open: '06:00', close: '21:00' },
    contactInfo: { phone: '+91-9876543212', email: 'info@tennisacademy.com' },
    image: 'https://images.unsplash.com/photo-1571019613047-7082a19e3f38?auto=format&fit=crop&w=400&q=80',
    isActive: true
  },
  {
    name: 'Multi-Sport Arena Rajkot',
    location: 'Rajkot',
    sport: 'Multi-Sport',
    description: 'State-of-the-art multi-sport facility with basketball and volleyball courts',
    capacity: 30,
    amenities: ['AC', 'Parking', 'Changing Room', 'Washroom', 'Water', 'Equipment Rental', 'First Aid', 'Cafeteria', 'WiFi'],
    sportsSupported: ['Basketball', 'Volleyball', 'Badminton'],
    pricing: { hourlyRate: 750, currency: 'INR' },
    operatingHours: { open: '06:00', close: '22:00' },
    contactInfo: { phone: '+91-9876543213', email: 'contact@multisport.com' },
    image: 'https://images.unsplash.com/photo-1546608235-76cb47451615?auto=format&fit=crop&w=400&q=80',
    isActive: true
  },
  {
    name: 'Swimming Pool Complex',
    location: 'Gandhinagar',
    sport: 'Swimming',
    description: 'Olympic-size swimming pool with professional training facilities',
    capacity: 40,
    amenities: ['Parking', 'Changing Room', 'Washroom', 'Water', 'First Aid', 'Cafeteria'],
    sportsSupported: ['Swimming'],
    pricing: { hourlyRate: 500, currency: 'INR' },
    operatingHours: { open: '05:30', close: '21:30' },
    contactInfo: { phone: '+91-9876543214', email: 'info@swimclub.com' },
    image: 'https://images.unsplash.com/photo-1571019613047-7082a19e3f38?auto=format&fit=crop&w=400&q=80',
    isActive: true
  }
];

async function setupSampleData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Venue.deleteMany({});

    // Create users
    console.log('👥 Creating sample users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    // Get facility managers and admin for venue assignment
    const admin = createdUsers.find(u => u.role === 'admin');
    const manager1 = createdUsers.find(u => u.email === 'manager1@example.com');
    const manager2 = createdUsers.find(u => u.email === 'manager2@example.com');

    // Create venues and assign to managers
    console.log('🏟️ Creating sample venues...');
    
    for (let i = 0; i < sampleVenues.length; i++) {
      const venueData = sampleVenues[i];
      
      // Assign venue to appropriate manager based on location
      let assignedManager = admin._id;
      if (venueData.location === 'Ahmedabad' && manager1) {
        assignedManager = manager1._id;
      } else if (venueData.location === 'Vadodara' && manager2) {
        assignedManager = manager2._id;
      }

      const venue = new Venue({
        ...venueData,
        owner: admin._id,
        manager: assignedManager
      });
      
      await venue.save();
      console.log(`✅ Created venue: ${venueData.name} in ${venueData.location}`);
    }

    console.log('🎉 Sample data setup completed successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin@example.com / password123');
    console.log('Manager 1 (Ahmedabad): manager1@example.com / password123');
    console.log('Manager 2 (Vadodara): manager2@example.com / password123');
    console.log('Player: player1@example.com / password123');
    
  } catch (error) {
    console.error('❌ Error setting up sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the setup
setupSampleData();

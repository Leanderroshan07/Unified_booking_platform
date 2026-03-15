#!/usr/bin/env node

/**
 * Simple CLI to manage unified-booking-platform data
 * 
 * Usage:
 *   node dataMgmt.js clear      - Clear all collections
 *   node dataMgmt.js status     - Show database status
 *   node dataMgmt.js seed-dummy - Seed dummy data into MongoDB
 */

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { seedAll } = require('./seedDummyData');

const Movie = require('./models/Movie');
const Hotel = require('./models/Hotel');
const Bus = require('./models/Bus');
const Flight = require('./models/Flight');
const Train = require('./models/Train');

const command = process.argv[2] || 'help';

async function ensureConnection() {
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    throw new Error('Unable to connect to MongoDB. Check backend/.env MONGO_URI.');
  }
}

async function clearAll() {
  try {
    await ensureConnection();
    console.log('\n🧹 Clearing all collections...\n');
    
    await Movie.deleteMany({});
    console.log('✓ Movies cleared');
    
    await Hotel.deleteMany({});
    console.log('✓ Hotels cleared');
    
    await Bus.deleteMany({});
    console.log('✓ Buses cleared');
    
    await Flight.deleteMany({});
    console.log('✓ Flights cleared');
    
    await Train.deleteMany({});
    console.log('✓ Trains cleared');
    
    console.log('\n✅ All collections cleared!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function showStatus() {
  try {
    await ensureConnection();
    console.log('\n📊 Database Status\n');
    
    const movieCount = await Movie.countDocuments();
    const hotelCount = await Hotel.countDocuments();
    const busCount = await Bus.countDocuments();
    const flightCount = await Flight.countDocuments();
    const trainCount = await Train.countDocuments();
    
    console.log('  Movies: ', movieCount);
    console.log('  Hotels: ', hotelCount);
    console.log('  Buses:  ', busCount);
    console.log('  Flights:', flightCount);
    console.log('  Trains: ', trainCount);
    console.log('\n  Total:  ', movieCount + hotelCount + busCount + flightCount + trainCount);
    console.log('\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function seedDummy() {
  try {
    console.log('\n📝 Seeding dummy data...\n');
    await seedAll();
    console.log('\n✅ Dummy data added successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function showHelp() {
  console.log(`
📚 Data Management CLI

Usage: node dataMgmt.js [command]

Commands:
  clear       - Remove all data from database
  status      - Show current database status
  seed-dummy  - Seed dummy data into MongoDB
  add-sample  - Alias for seed-dummy
  help        - Show this message

Examples:
  node dataMgmt.js clear
  node dataMgmt.js status
  node dataMgmt.js seed-dummy

`);
}

async function run() {
  try {
    switch (command) {
      case 'clear':
        await clearAll();
        break;
      case 'status':
        await showStatus();
        break;
      case 'seed-dummy':
      case 'add-sample':
        await seedDummy();
        break;
      case 'help':
      default:
        await showHelp();
    }
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close().catch(() => {});
    }
    process.exit(0);
  }
}

run();

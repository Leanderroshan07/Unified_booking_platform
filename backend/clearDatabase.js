/**
 * Database Cleanup Utility
 * Run: node clearDatabase.js
 * Clears all test data from collections
 */

const mongoose = require('mongoose');
const connectDB = require('./config/db');

const collections = ['movies', 'buses', 'flights', 'trains', 'hotels', 'rooms'];

async function clearDatabase() {
  try {
    await connectDB();

    if (mongoose.connection.readyState !== 1) {
      throw new Error('Unable to connect to MongoDB. Check backend/.env MONGO_URI.');
    }

    console.log('🧹 Clearing database...\n');

    for (const collectionName of collections) {
      try {
        const result = await mongoose.connection.collection(collectionName).deleteMany({});
        console.log(`✓ ${collectionName.padEnd(12)} cleared (${result.deletedCount} documents removed)`);
      } catch (err) {
        if (err.message.includes('does not exist')) {
          console.log(`- ${collectionName.padEnd(12)} (empty)`);
        } else {
          console.error(`✗ ${collectionName.padEnd(12)} error:`, err.message);
        }
      }
    }

    console.log('\n✅ Database cleared successfully!');
    console.log('📝 You can now add your own data via:');
    console.log('   - API endpoints (POST /api/movies, /api/buses, etc.)');
    console.log('   - Import scripts');
    console.log('   - Database seeding tools\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close().catch(() => {});
    }
  }
}

clearDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

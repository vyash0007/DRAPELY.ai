#!/usr/bin/env node

/**
 * Wake up Neon database
 *
 * Neon free tier databases automatically pause after inactivity.
 * Run this script to wake up the database before starting your dev server.
 *
 * Usage: node wake-db.js
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function wakeDatabase() {
  console.log('🔄 Attempting to wake up Neon database...');

  try {
    // Simple query to wake up the database
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database is awake and ready!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to wake database:', error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Check your DATABASE_URL in .env file');
    console.log('2. Verify your Neon database is active at https://console.neon.tech/');
    console.log('3. Wait a few seconds and try again - databases can take time to wake up');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

wakeDatabase();

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  await mongoose.connect(uri);

  // Set env vars for tests
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_EXPIRE = '7d';
};

const closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) {
    await mongoServer.stop();
  }
};

const clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports = { connect, closeDatabase, clearDatabase };

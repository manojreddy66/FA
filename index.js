const prisma = {
  $transaction: jest.fn(async (fn) => {
    // Execute transaction callback
    return fn();
  }),
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $connect: jest.fn(),
  $disconnect: jest.fn()
};
 
async function getDatabaseURL() {
  return '';
}
 
async function dbConnect() {
  return { prisma };
}
 
async function dbDisconnect() {
  return true;
}
 
module.exports = {
  getDatabaseURL,
  dbConnect,
  dbDisconnect,
};
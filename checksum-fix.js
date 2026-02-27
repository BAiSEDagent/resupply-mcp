import { getAddress } from 'viem';

const addr = '0x10101010E0C3171D894B71b3400668aF311e7D94';
try {
  const checksummed = getAddress(addr);
  console.log('Checksummed:', checksummed);
} catch (error) {
  console.log('Invalid address:', error.message);
}

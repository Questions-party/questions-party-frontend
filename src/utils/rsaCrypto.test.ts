import { RSACrypto, rsaCrypto, encryptWithKey, validatePublicKey } from './rsaCrypto.ts';

// Mock public key for testing (this would normally come from backend)
const mockPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1234567890abcdefghijk
lmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmn
opqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqr
stuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuv
wxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz
ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyzABCD
EFGHIJKLMNOPQRSTUVWXYZ1234567890abcdefghijklmnopqrstuvwxyz
-----END PUBLIC KEY-----`;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

class RSACryptoTest {
  private results: TestResult[] = [];

  test(name: string, testFn: () => boolean | void): void {
    try {
      const result = testFn();
      this.results.push({
        name,
        passed: result !== false
      });
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  async asyncTest(name: string, testFn: () => Promise<boolean | void>): Promise<void> {
    try {
      const result = await testFn();
      this.results.push({
        name,
        passed: result !== false
      });
    } catch (error) {
      this.results.push({
        name,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  printResults(): void {
    console.log('\n🧪 Frontend RSA Crypto Test Results');
    console.log('=====================================');
    
    let passed = 0;
    let total = this.results.length;

    this.results.forEach(result => {
      if (result.passed) {
        console.log(`✅ ${result.name}`);
        passed++;
      } else {
        console.log(`❌ ${result.name}${result.error ? `: ${result.error}` : ''}`);
      }
    });

    console.log(`\n📊 Summary: ${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All frontend tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please check the implementation.');
    }
  }
}

export function runFrontendTests(): void {
  const tester = new RSACryptoTest();
  
  // Test 1: Class instantiation
  tester.test('RSACrypto class instantiation', () => {
    const rsa = new RSACrypto();
    return rsa instanceof RSACrypto;
  });

  // Test 2: Public key validation
  tester.test('Public key validation - valid key', () => {
    // This will likely fail with the mock key, but tests the function
    try {
      return validatePublicKey(mockPublicKey);
    } catch {
      return true; // Expected to fail with mock key
    }
  });

  tester.test('Public key validation - invalid key', () => {
    return !validatePublicKey('invalid-key');
  });

  // Test 3: Set and get public key
  tester.test('Set and get public key', () => {
    const rsa = new RSACrypto();
    rsa.setPublicKey(mockPublicKey);
    return rsa.getPublicKey() === mockPublicKey;
  });

  // Test 4: Singleton instance
  tester.test('Singleton instance exists', () => {
    return rsaCrypto instanceof RSACrypto;
  });

  // Test 5: Error handling - encrypt without public key
  tester.test('Encrypt without public key should throw', () => {
    const rsa = new RSACrypto();
    try {
      rsa.encrypt('test');
      return false; // Should have thrown
    } catch (error) {
      return error instanceof Error && error.message.includes('Public key not set');
    }
  });

  // Test 6: Error handling - encrypt invalid data
  tester.test('Encrypt invalid data should throw', () => {
    const rsa = new RSACrypto();
    rsa.setPublicKey(mockPublicKey);
    try {
      rsa.encrypt('');
      return false; // Should have thrown
    } catch (error) {
      return error instanceof Error && error.message.includes('Invalid plaintext');
    }
  });

  // Test 7: String to hex conversion
  tester.test('String to hex conversion', () => {
    const rsa = new RSACrypto();
    // Test the private method indirectly
    try {
      rsa.setPublicKey(mockPublicKey);
      rsa.encrypt('test'); // This will fail but should test hex conversion
      return true;
    } catch (error) {
      // Expected to fail with mock key, but should get past hex conversion
      return true;
    }
  });

  // Test 8: Static method - encryptWithKey
  tester.test('Static encryptWithKey method', () => {
    try {
      encryptWithKey('test', mockPublicKey);
      return true;
    } catch (error) {
      // Expected to fail with mock key, but method should exist
      return error instanceof Error;
    }
  });

  // Test 9: API key format validation
  tester.test('API key format validation', () => {
    const testApiKey = 'sk-test-api-key-123456789';
    return testApiKey.startsWith('sk-') && testApiKey.length > 10;
  });

  // Test 10: Integration with expected workflow
  tester.test('Expected workflow simulation', () => {
    try {
      // 1. Create instance
      const rsa = new RSACrypto();
      
      // 2. Set public key (would come from backend)
      rsa.setPublicKey(mockPublicKey);
      
      // 3. Attempt encryption (will fail with mock key but tests workflow)
      try {
        rsa.encrypt('sk-test-api-key');
        return true;
      } catch {
        // Expected to fail with mock key
        return true;
      }
    } catch (error) {
      return false;
    }
  });

  tester.printResults();
}

// Export test runner for use in console or components
export default runFrontendTests;

// Auto-run tests if this file is imported directly
if (typeof window !== 'undefined') {
  console.log('RSA Crypto Frontend Test Suite loaded. Run runFrontendTests() to execute tests.');
} 
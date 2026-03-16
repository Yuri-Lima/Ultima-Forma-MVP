import { randomBytes } from 'node:crypto';
import { encryptSecret, decryptSecret } from './crypto.utils';

describe('crypto.utils', () => {
  const validKey = randomBytes(32).toString('hex');

  it('should encrypt and decrypt a secret round-trip', () => {
    const secret = 'my-super-secret-api-key-12345';
    const encrypted = encryptSecret(secret, validKey);
    const decrypted = decryptSecret(encrypted, validKey);

    expect(decrypted).toBe(secret);
    expect(encrypted).not.toBe(secret);
  });

  it('should produce different ciphertexts for the same input (random IV)', () => {
    const secret = 'same-secret';
    const encrypted1 = encryptSecret(secret, validKey);
    const encrypted2 = encryptSecret(secret, validKey);

    expect(encrypted1).not.toBe(encrypted2);

    expect(decryptSecret(encrypted1, validKey)).toBe(secret);
    expect(decryptSecret(encrypted2, validKey)).toBe(secret);
  });

  it('should fail to decrypt with a different key', () => {
    const secret = 'important-data';
    const encrypted = encryptSecret(secret, validKey);
    const wrongKey = randomBytes(32).toString('hex');

    expect(() => decryptSecret(encrypted, wrongKey)).toThrow();
  });

  it('should reject invalid key length', () => {
    expect(() => encryptSecret('test', 'too-short')).toThrow(
      'CREDENTIAL_ENCRYPTION_KEY must be a 32-byte (64 hex chars) key'
    );
    expect(() => decryptSecret('dGVzdA==', 'too-short')).toThrow(
      'CREDENTIAL_ENCRYPTION_KEY must be a 32-byte (64 hex chars) key'
    );
  });

  it('should handle empty string', () => {
    const encrypted = encryptSecret('', validKey);
    const decrypted = decryptSecret(encrypted, validKey);
    expect(decrypted).toBe('');
  });

  it('should handle long secrets', () => {
    const longSecret = randomBytes(256).toString('hex');
    const encrypted = encryptSecret(longSecret, validKey);
    const decrypted = decryptSecret(encrypted, validKey);
    expect(decrypted).toBe(longSecret);
  });
});

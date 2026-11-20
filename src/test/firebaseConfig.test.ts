import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isFirebaseConfigured, firebaseConfig } from '@/lib/firebase';

describe('Firebase Configuration & Credential Validation (isFirebaseConfigured)', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it('should identify YOUR_ACTUAL_API_KEY as an unconfigured placeholder', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'YOUR_ACTUAL_API_KEY');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789012:web:abcdef1234567890');
    expect(isFirebaseConfigured()).toBe(false);
  });

  it('should identify missing or empty API keys as unconfigured', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', '');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '');
    expect(isFirebaseConfigured()).toBe(false);
  });

  it('should reject placeholder App IDs', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'YOUR_ACTUAL_APP_ID');
    expect(isFirebaseConfigured()).toBe(false);
  });

  it('should reject ExampleKey placeholder keys', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'AIzaSyExampleKey-YourApiKeyHere');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:123456789012:web:abcdef1234567890');
    expect(isFirebaseConfigured()).toBe(false);
  });

  it('should accept valid Google API keys starting with AIza and authentic App IDs', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'AIzaSyC9aX8yZ7wV6uT5sR4qP3oN2mL1k0jI9hG');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:987654321098:web:7890abcdef123456');
    expect(isFirebaseConfigured()).toBe(true);
  });

  it('should validate the real user Firebase Web App configuration', () => {
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'AIzaSyCjIoUbRrEYHbxaXFrysZUlvwm9SvkbvC8');
    vi.stubEnv('VITE_FIREBASE_APP_ID', '1:207765339774:web:36bd49566f5c8797f9e22f');
    expect(isFirebaseConfigured()).toBe(true);
  });

  it('should initialize with project ID matching careerLens-ai-8beae', () => {
    expect(firebaseConfig.projectId.toLowerCase()).toBe('careerlens-ai-8beae');
  });
});

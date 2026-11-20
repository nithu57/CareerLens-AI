import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserProfile,
  saveUserProfile,
  updateUserProfile,
  subscribeUserProfile,
} from '@/services/userService';
import * as firestore from 'firebase/firestore';
import { UserProfile } from '@/types';

vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<any>('firebase/firestore');
  return {
    ...actual,
    doc: vi.fn((_db, col, id) => ({ path: `${col}/${id}`, id })),
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    updateDoc: vi.fn(),
    onSnapshot: vi.fn(),
  };
});

vi.mock('@/lib/firebase', () => ({
  db: {},
  storage: {},
}));

describe('User Service & Firestore Profile Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saveUserProfile cleans undefined properties and uses merge: true', async () => {
    const mockSetDoc = vi.mocked(firestore.setDoc).mockResolvedValue(undefined as any);

    const testProfile: UserProfile = {
      uid: 'user-123',
      email: 'test@example.com',
      displayName: 'Test User',
      onboardingCompleted: false,
      education: undefined,
      targetRole: 'Full-Stack Developer',
      createdAt: '2026-10-17T10:00:00.000Z',
      updatedAt: '2026-10-17T10:00:00.000Z',
    };

    await saveUserProfile(testProfile);

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [docRef, payload, options] = mockSetDoc.mock.calls[0];
    const payloadData = payload as any;
    expect((docRef as any).id).toBe('user-123');
    expect(payloadData.education).toBeUndefined();
    expect(payloadData.uid).toBe('user-123');
    expect(payloadData.email).toBe('test@example.com');
    expect(payloadData.targetRole).toBe('Full-Stack Developer');
    expect(options).toEqual({ merge: true });
  });

  it('updateUserProfile uses setDoc with merge: true, ensures uid, and excludes undefined fields', async () => {
    const mockSetDoc = vi.mocked(firestore.setDoc).mockResolvedValue(undefined as any);

    const updates: Partial<UserProfile> = {
      displayName: 'Updated Name',
      targetRole: 'AI Engineer',
      weeklyHours: 15,
      education: undefined,
      onboardingCompleted: true,
    };

    await updateUserProfile('user-456', updates);

    expect(mockSetDoc).toHaveBeenCalledTimes(1);
    const [docRef, payload, options] = mockSetDoc.mock.calls[0];
    const payloadData = payload as any;
    expect((docRef as any).id).toBe('user-456');
    expect(payloadData.uid).toBe('user-456');
    expect(payloadData.displayName).toBe('Updated Name');
    expect(payloadData.targetRole).toBe('AI Engineer');
    expect(payloadData.weeklyHours).toBe(15);
    expect(payloadData.onboardingCompleted).toBe(true);
    expect(payloadData.education).toBeUndefined();
    expect(payloadData.updatedAt).toBeDefined();
    expect(options).toEqual({ merge: true });
  });

  it('getUserProfile returns null gracefully if Firestore throws an offline error', async () => {
    vi.mocked(firestore.getDoc).mockRejectedValueOnce(
      new Error('Failed to get document because the client is offline.')
    );

    const result = await getUserProfile('user-offline');
    expect(result).toBeNull();
  });

  it('getUserProfile returns user profile when document exists', async () => {
    vi.mocked(firestore.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        uid: 'user-789',
        email: 'person@domain.com',
        displayName: 'Person',
        onboardingCompleted: true,
      }),
    } as any);

    const result = await getUserProfile('user-789');
    expect(result).not.toBeNull();
    expect(result?.displayName).toBe('Person');
    expect(result?.onboardingCompleted).toBe(true);
  });

  it('subscribeUserProfile passes data on snapshot and handles error without throwing', () => {
    let snapshotCallback: any;
    let errorCallback: any;

    vi.mocked(firestore.onSnapshot).mockImplementation((_ref: any, onNext: any, onError?: any) => {
      snapshotCallback = onNext;
      errorCallback = onError;
      return () => {};
    });

    const userCallback = vi.fn();
    const onErrorCallback = vi.fn();

    subscribeUserProfile('user-sub', userCallback, onErrorCallback);

    // Simulate snapshot
    snapshotCallback({
      exists: () => true,
      data: () => ({ uid: 'user-sub', displayName: 'Subscribed User' }),
    });
    expect(userCallback).toHaveBeenCalledWith({ uid: 'user-sub', displayName: 'Subscribed User' });

    // Simulate listener error
    const testError = new Error('Permission denied');
    errorCallback(testError);
    expect(onErrorCallback).toHaveBeenCalledWith(testError);
  });
});


import { renderHook, act } from '@testing-library/react-hooks';
import { useMemorySettings, defaultMemoryStats } from '../useMemorySettings';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/integrations/supabase/client');

describe('useMemorySettings', () => {
  // Setup mocks
  const mockUser = {
    id: 'test-user-id',
    subscription_tier: 'basic'
  };
  
  const mockPremiumUser = {
    id: 'premium-user-id',
    subscription_tier: 'premium'
  };
  
  const mockFreeUser = {
    id: 'free-user-id',
    subscription_tier: 'free'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      return {
        select: jest.fn().mockImplementation((columns) => ({
          eq: jest.fn().mockImplementation((field, value) => ({
            single: jest.fn().mockImplementation(() => 
              Promise.resolve({
                data: {
                  memory_enabled: true,
                  smart_insights_enabled: false
                },
                error: null
              })
            )
          }))
        })),
        update: jest.fn().mockImplementation((data) => ({
          eq: jest.fn().mockImplementation((field, value) => 
            Promise.resolve({ error: null })
          )
        }))
      };
    });
    
    (supabase.functions.invoke as jest.Mock).mockImplementation((functionName, options) => {
      return Promise.resolve({
        data: {
          totalMemories: 10,
          insightCount: 3,
          messageCount: 5,
          topicCount: 2
        },
        error: null
      });
    });
  });

  test('should initialize with default values', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMemorySettings());
    
    // Initial state should be defaults
    expect(result.current.memoryEnabled).toBe(false);
    expect(result.current.smartInsightsEnabled).toBe(false);
    expect(result.current.memoryStats).toEqual(defaultMemoryStats);
    expect(result.current.isLoading).toBe(false);
    
    // Wait for useEffect to complete
    await waitForNextUpdate();
    
    // After loading settings
    expect(result.current.memoryEnabled).toBe(true);
    expect(result.current.smartInsightsEnabled).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  test('should load user preferences from database', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMemorySettings());
    
    await waitForNextUpdate();
    
    // Verify Supabase was called correctly
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.from('profiles').select).toHaveBeenCalled();
    expect(supabase.from('profiles').select().eq).toHaveBeenCalledWith('id', mockUser.id);
  });

  test('should disable all features for free users', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockFreeUser });
    
    const { result, waitForNextUpdate } = renderHook(() => useMemorySettings());
    
    await waitForNextUpdate();
    
    expect(result.current.memoryEnabled).toBe(false);
    expect(result.current.smartInsightsEnabled).toBe(false);
    expect(result.current.memoryStats).toEqual(defaultMemoryStats);
  });

  test('should enable smart insights for premium users by default', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockPremiumUser });
    
    // Mock no existing preferences
    (supabase.from as jest.Mock).mockImplementation((table) => {
      return {
        select: jest.fn().mockImplementation((columns) => ({
          eq: jest.fn().mockImplementation((field, value) => ({
            single: jest.fn().mockImplementation(() => 
              Promise.resolve({
                data: null,
                error: { message: 'No data found' }
              })
            )
          }))
        })),
        update: jest.fn().mockImplementation((data) => ({
          eq: jest.fn().mockImplementation((field, value) => 
            Promise.resolve({ error: null })
          )
        }))
      };
    });
    
    const { result, waitForNextUpdate } = renderHook(() => useMemorySettings());
    
    await waitForNextUpdate();
    
    expect(result.current.memoryEnabled).toBe(true);
    expect(result.current.smartInsightsEnabled).toBe(true);
  });

  test('should refresh memory stats', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useMemorySettings());
    
    await waitForNextUpdate();
    
    // Reset mocks to check refreshMemoryStats call
    jest.clearAllMocks();
    
    // Call refresh function
    await act(async () => {
      await result.current.refreshMemoryStats();
    });
    
    // Verify function call
    expect(supabase.functions.invoke).toHaveBeenCalledWith('memory-stats', {
      body: { userId: mockUser.id }
    });
    
    // Check updated stats
    expect(result.current.memoryStats).toEqual({
      totalMemories: 10,
      insightCount: 3,
      messageCount: 5,
      topicCount: 2
    });
  });
});


import { renderHook, act } from '@testing-library/react-hooks';
import { useMemoryOperations } from '../useMemoryOperations';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { defaultMemoryStats } from '../useMemorySettings';
import { toast } from '@/components/ui/use-toast';

// Mock dependencies
jest.mock('@/context/AuthContext');
jest.mock('@/integrations/supabase/client');
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn()
}));

describe('useMemoryOperations', () => {
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

  // Mock setter functions
  const setMemoryEnabled = jest.fn();
  const setSmartInsightsEnabled = jest.fn();
  const setMemoryStats = jest.fn();
  const refreshMemoryStats = jest.fn().mockResolvedValue(undefined);

  // Sample archived memory
  const sampleArchivedMemory = {
    id: 'archived-memory-id',
    content: 'Test memory content',
    memory_type: 'insight',
    metadata: { importance: 5 },
    archived_at: '2025-05-10T12:00:00Z'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup default mocks
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    
    // Mock Supabase responses
    (supabase.from as jest.Mock).mockImplementation((table) => {
      return {
        update: jest.fn().mockImplementation((data) => ({
          eq: jest.fn().mockImplementation((field, value) => 
            Promise.resolve({ error: null })
          )
        })),
        insert: jest.fn().mockImplementation((data) => 
          Promise.resolve({ error: null })
        ),
        select: jest.fn().mockImplementation((query) => ({
          eq: jest.fn().mockImplementation((field, value) => ({
            order: jest.fn().mockImplementation((orderField, options) => 
              Promise.resolve({
                data: [sampleArchivedMemory],
                error: null
              })
            )
          }))
        })),
        delete: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation((field, value) => ({
            eq: jest.fn().mockImplementation((field, value) => 
              Promise.resolve({ error: null })
            )
          }))
        }))
      };
    });
    
    (supabase.functions.invoke as jest.Mock).mockImplementation((functionName, options) => {
      switch (functionName) {
        case 'fetch-memories':
          return Promise.resolve({
            data: [{ id: 'memory-id', content: 'Memory content', type: 'message', metadata: {} }],
            error: null
          });
        case 'delete-memories':
          return Promise.resolve({
            data: { success: true },
            error: null
          });
        case 'restore-memory':
          return Promise.resolve({
            data: { success: true },
            error: null
          });
        default:
          return Promise.resolve({
            data: null,
            error: { message: 'Unknown function' }
          });
      }
    });
  });

  test('should toggle memory setting', async () => {
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    // Test enabling memory
    let success;
    await act(async () => {
      success = await result.current.toggleMemory(true);
    });
    
    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.from('profiles').update).toHaveBeenCalledWith({
      memory_enabled: true,
      updated_at: expect.any(String)
    });
    expect(setMemoryEnabled).toHaveBeenCalledWith(true);
  });

  test('should not allow free users to enable memory', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockFreeUser });
    
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    let success;
    await act(async () => {
      success = await result.current.toggleMemory(true);
    });
    
    expect(success).toBe(false);
    expect(setMemoryEnabled).not.toHaveBeenCalled();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  test('should toggle smart insights for premium users only', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: mockPremiumUser });
    
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    let success;
    await act(async () => {
      success = await result.current.toggleSmartInsights(true);
    });
    
    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('profiles');
    expect(supabase.from('profiles').update).toHaveBeenCalledWith({
      smart_insights_enabled: true,
      updated_at: expect.any(String)
    });
    expect(setSmartInsightsEnabled).toHaveBeenCalledWith(true);
    
    // Now test with non-premium user
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    
    const { result: basicResult } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    await act(async () => {
      success = await basicResult.current.toggleSmartInsights(true);
    });
    
    expect(success).toBe(false);
  });

  test('should archive memory', async () => {
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    const memoryId = 'test-memory-id';
    const content = 'Test memory content';
    const memoryType = 'insight';
    const metadata = { topic: 'testing' };
    
    let success;
    await act(async () => {
      success = await result.current.archiveMemory(memoryId, content, memoryType, metadata);
    });
    
    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('user_archived_memories');
    expect(supabase.from('user_archived_memories').insert).toHaveBeenCalledWith({
      user_id: mockUser.id,
      content,
      memory_type: memoryType,
      metadata,
      original_memory_id: memoryId
    });
  });

  test('should clear all memories', async () => {
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    let success;
    await act(async () => {
      success = await result.current.clearAllMemories(false);
    });
    
    expect(success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('delete-memories', {
      body: { userId: mockUser.id }
    });
    expect(setMemoryStats).toHaveBeenCalledWith(defaultMemoryStats);
  });

  test('should archive before clearing when requested', async () => {
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    let success;
    await act(async () => {
      success = await result.current.clearAllMemories(true);
    });
    
    expect(success).toBe(true);
    
    // Should fetch memories first
    expect(supabase.functions.invoke).toHaveBeenCalledWith('fetch-memories', {
      body: { userId: mockUser.id }
    });
    
    // Then delete them
    expect(supabase.functions.invoke).toHaveBeenCalledWith('delete-memories', {
      body: { userId: mockUser.id }
    });
  });

  test('should get archived memories', async () => {
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    let memories;
    await act(async () => {
      memories = await result.current.getArchivedMemories();
    });
    
    expect(memories).toEqual([sampleArchivedMemory]);
    expect(supabase.from).toHaveBeenCalledWith('user_archived_memories');
    expect(supabase.from('user_archived_memories').select).toHaveBeenCalled();
    expect(supabase.from('user_archived_memories').select().eq).toHaveBeenCalledWith('user_id', mockUser.id);
    expect(supabase.from('user_archived_memories').select().eq('user_id', mockUser.id).order).toHaveBeenCalledWith('archived_at', { ascending: false });
  });

  test('should delete archived memory', async () => {
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    const memoryId = 'archived-memory-id';
    
    let success;
    await act(async () => {
      success = await result.current.deleteArchivedMemory(memoryId);
    });
    
    expect(success).toBe(true);
    expect(supabase.from).toHaveBeenCalledWith('user_archived_memories');
    expect(supabase.from('user_archived_memories').delete).toHaveBeenCalled();
    expect(supabase.from('user_archived_memories').delete().eq).toHaveBeenCalledWith('id', memoryId);
    expect(supabase.from('user_archived_memories').delete().eq('id', memoryId).eq).toHaveBeenCalledWith('user_id', mockUser.id);
  });

  test('should restore memory', async () => {
    const { result } = renderHook(() => useMemoryOperations(
      setMemoryEnabled,
      setSmartInsightsEnabled,
      setMemoryStats,
      refreshMemoryStats
    ));
    
    let success;
    await act(async () => {
      success = await result.current.restoreMemory(sampleArchivedMemory);
    });
    
    expect(success).toBe(true);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('restore-memory', {
      body: { 
        userId: mockUser.id,
        content: sampleArchivedMemory.content,
        memoryType: sampleArchivedMemory.memory_type,
        metadata: sampleArchivedMemory.metadata
      }
    });
    expect(refreshMemoryStats).toHaveBeenCalled();
  });
});

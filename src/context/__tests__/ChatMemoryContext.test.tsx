
import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';
import { ChatMemoryProvider, useChatMemory } from '@/context/ChatMemoryContext';
import { useMemorySettings } from '@/hooks/useMemorySettings';
import { useMemoryOperations } from '@/hooks/useMemoryOperations';

// Mock the hooks we're using
jest.mock('@/hooks/useMemorySettings');
jest.mock('@/hooks/useMemoryOperations');

describe('ChatMemoryContext', () => {
  // Sample data
  const mockMemoryStats = {
    totalMemories: 10,
    insightCount: 3,
    messageCount: 5,
    topicCount: 2
  };
  
  const mockArchivedMemories = [
    {
      id: 'archived-1',
      content: 'Archived memory 1',
      memory_type: 'message',
      archived_at: '2025-05-10T12:00:00Z'
    },
    {
      id: 'archived-2',
      content: 'Archived memory 2',
      memory_type: 'insight',
      archived_at: '2025-05-11T12:00:00Z',
      metadata: { importance: 5 }
    }
  ];

  // Mock functions
  const toggleMemoryMock = jest.fn().mockResolvedValue(true);
  const toggleSmartInsightsMock = jest.fn().mockResolvedValue(true);
  const refreshMemoryStatsMock = jest.fn().mockResolvedValue(undefined);
  const clearAllMemoriesMock = jest.fn().mockResolvedValue(true);
  const getArchivedMemoriesMock = jest.fn().mockResolvedValue(mockArchivedMemories);
  const deleteArchivedMemoryMock = jest.fn().mockResolvedValue(true);
  const restoreMemoryMock = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup useMemorySettings mock
    (useMemorySettings as jest.Mock).mockReturnValue({
      memoryEnabled: true,
      setMemoryEnabled: jest.fn(),
      smartInsightsEnabled: false,
      setSmartInsightsEnabled: jest.fn(),
      memoryStats: mockMemoryStats,
      setMemoryStats: jest.fn(),
      isLoading: false,
      refreshMemoryStats: refreshMemoryStatsMock
    });
    
    // Setup useMemoryOperations mock
    (useMemoryOperations as jest.Mock).mockReturnValue({
      toggleMemory: toggleMemoryMock,
      toggleSmartInsights: toggleSmartInsightsMock,
      clearAllMemories: clearAllMemoriesMock,
      getArchivedMemories: getArchivedMemoriesMock,
      deleteArchivedMemory: deleteArchivedMemoryMock,
      restoreMemory: restoreMemoryMock
    });
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ChatMemoryProvider>{children}</ChatMemoryProvider>
  );

  test('should provide memory context values', () => {
    const { result } = renderHook(() => useChatMemory(), { wrapper });
    
    expect(result.current).toEqual(expect.objectContaining({
      memoryEnabled: true,
      smartInsightsEnabled: false,
      memoryStats: mockMemoryStats,
      isLoading: false,
      archivedMemories: [],
      isLoadingArchive: false
    }));
    
    // Methods should be defined
    expect(typeof result.current.toggleMemory).toBe('function');
    expect(typeof result.current.toggleSmartInsights).toBe('function');
    expect(typeof result.current.refreshMemoryStats).toBe('function');
    expect(typeof result.current.clearAllMemories).toBe('function');
    expect(typeof result.current.loadArchivedMemories).toBe('function');
    expect(typeof result.current.deleteArchivedMemory).toBe('function');
    expect(typeof result.current.restoreMemory).toBe('function');
  });

  test('should load archived memories', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useChatMemory(), { wrapper });
    
    await act(async () => {
      result.current.loadArchivedMemories();
    });
    
    // Loading state should be true initially
    expect(result.current.isLoadingArchive).toBe(true);
    
    // Wait for the operation to complete
    await waitForNextUpdate();
    
    // Should have called the operation
    expect(getArchivedMemoriesMock).toHaveBeenCalled();
    
    // Should have updated the state
    expect(result.current.archivedMemories).toEqual(mockArchivedMemories);
    expect(result.current.isLoadingArchive).toBe(false);
  });

  test('should toggle memory', async () => {
    const { result } = renderHook(() => useChatMemory(), { wrapper });
    
    await act(async () => {
      await result.current.toggleMemory(true);
    });
    
    expect(toggleMemoryMock).toHaveBeenCalledWith(true);
  });

  test('should toggle smart insights', async () => {
    const { result } = renderHook(() => useChatMemory(), { wrapper });
    
    await act(async () => {
      await result.current.toggleSmartInsights(true);
    });
    
    expect(toggleSmartInsightsMock).toHaveBeenCalledWith(true);
  });

  test('should clear memories with archive option', async () => {
    const { result } = renderHook(() => useChatMemory(), { wrapper });
    
    await act(async () => {
      await result.current.clearAllMemories(true);
    });
    
    expect(clearAllMemoriesMock).toHaveBeenCalledWith(true);
    expect(getArchivedMemoriesMock).toHaveBeenCalled();
  });

  test('should delete archived memory', async () => {
    const { result } = renderHook(() => useChatMemory(), { wrapper });
    
    // First load memories
    await act(async () => {
      await result.current.loadArchivedMemories();
    });
    
    const memoryId = 'archived-1';
    
    // Then delete one
    await act(async () => {
      await result.current.deleteArchivedMemory(memoryId);
    });
    
    expect(deleteArchivedMemoryMock).toHaveBeenCalledWith(memoryId);
  });

  test('should restore memory', async () => {
    const { result } = renderHook(() => useChatMemory(), { wrapper });
    
    // First load memories
    await act(async () => {
      await result.current.loadArchivedMemories();
    });
    
    const memory = mockArchivedMemories[0];
    
    // Then restore one
    await act(async () => {
      await result.current.restoreMemory(memory);
    });
    
    expect(restoreMemoryMock).toHaveBeenCalledWith(memory);
  });
  
  test('should throw error when used outside provider', () => {
    // Render without provider
    const { result } = renderHook(() => useChatMemory());
    
    // Should throw an error
    expect(result.error).toEqual(
      new Error("useChatMemory must be used within ChatMemoryProvider")
    );
  });
});

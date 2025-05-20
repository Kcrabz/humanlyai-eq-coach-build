
import { useCallback, useMemo } from 'react';

/**
 * Animation timing constants in milliseconds
 */
export const ANIMATION_TIMING = {
  // Base timing values
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
  
  // Special timing values for specific animations
  PAGE_TRANSITION: 400,
  TYPEWRITER_CHAR_STAGGER: 50,
  TYPEWRITER_WORD_STAGGER: 100,
  HOVER_TRANSITION: 250,
  BLOB_ANIMATION: 12000,
  CURSOR_BLINK: 800,
  
  // Easing functions (as strings for CSS)
  EASE_OUT: 'cubic-bezier(0.22, 1, 0.36, 1)',
  EASE_IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)',
  SPRING: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  BOUNCE: 'cubic-bezier(0.34, 1.56, 0.64, 1.1)',
};

/**
 * Types for animation speeds
 */
export type AnimationSpeed = 'fast' | 'normal' | 'slow' | 'very-slow';
export type EasingType = 'ease-out' | 'ease-in-out' | 'spring' | 'bounce';

/**
 * Hook for consistent animation timing throughout the application
 */
export const useAnimationTiming = () => {
  /**
   * Get duration in ms from speed name
   */
  const getDuration = useCallback((speed: AnimationSpeed = 'normal'): number => {
    switch (speed) {
      case 'fast': return ANIMATION_TIMING.FAST;
      case 'normal': return ANIMATION_TIMING.NORMAL;
      case 'slow': return ANIMATION_TIMING.SLOW;
      case 'very-slow': return ANIMATION_TIMING.VERY_SLOW;
      default: return ANIMATION_TIMING.NORMAL;
    }
  }, []);

  /**
   * Get easing function as CSS string
   */
  const getEasing = useCallback((type: EasingType = 'ease-out'): string => {
    switch (type) {
      case 'ease-out': return ANIMATION_TIMING.EASE_OUT;
      case 'ease-in-out': return ANIMATION_TIMING.EASE_IN_OUT;
      case 'spring': return ANIMATION_TIMING.SPRING;
      case 'bounce': return ANIMATION_TIMING.BOUNCE;
      default: return ANIMATION_TIMING.EASE_OUT;
    }
  }, []);

  /**
   * Generate CSS transition string
   */
  const createTransition = useCallback((
    properties: string | string[] = 'all', 
    speed: AnimationSpeed = 'normal',
    easing: EasingType = 'ease-out'
  ): string => {
    const duration = getDuration(speed);
    const easingFunc = getEasing(easing);
    const props = Array.isArray(properties) ? properties.join(', ') : properties;
    
    return `${props} ${duration}ms ${easingFunc}`;
  }, [getDuration, getEasing]);

  /**
   * Get stagger delay for sequence animations
   */
  const getStaggerDelay = useCallback((
    index: number, 
    baseDelay: number = 0, 
    staggerAmount: number = 50
  ): number => {
    return baseDelay + (index * staggerAmount);
  }, []);

  /**
   * Framer Motion animation presets
   */
  const framerPresets = useMemo(() => ({
    fadeIn: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: getDuration('normal') / 1000, ease: ANIMATION_TIMING.EASE_OUT }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: getDuration('normal') / 1000, ease: ANIMATION_TIMING.SPRING }
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: getDuration('normal') / 1000, ease: ANIMATION_TIMING.EASE_OUT }
    },
    staggerChildren: (staggerAmount: number = 0.05) => ({
      transition: { staggerChildren: staggerAmount }
    }),
  }), [getDuration]);

  /**
   * Get typewriter timing settings based on speed
   */
  const getTypewriterTiming = useCallback((speed: AnimationSpeed = 'normal') => {
    let charStagger: number;
    let wordStagger: number;
    
    switch (speed) {
      case 'fast':
        charStagger = ANIMATION_TIMING.TYPEWRITER_CHAR_STAGGER / 2;
        wordStagger = ANIMATION_TIMING.TYPEWRITER_WORD_STAGGER / 2;
        break;
      case 'slow':
        charStagger = ANIMATION_TIMING.TYPEWRITER_CHAR_STAGGER * 1.5;
        wordStagger = ANIMATION_TIMING.TYPEWRITER_WORD_STAGGER * 1.5;
        break;
      case 'very-slow':
        charStagger = ANIMATION_TIMING.TYPEWRITER_CHAR_STAGGER * 2;
        wordStagger = ANIMATION_TIMING.TYPEWRITER_WORD_STAGGER * 2;
        break;
      default:
        charStagger = ANIMATION_TIMING.TYPEWRITER_CHAR_STAGGER;
        wordStagger = ANIMATION_TIMING.TYPEWRITER_WORD_STAGGER;
    }
    
    return { charStagger, wordStagger };
  }, []);

  return {
    constants: ANIMATION_TIMING,
    getDuration,
    getEasing,
    createTransition,
    getStaggerDelay,
    framerPresets,
    getTypewriterTiming
  };
};

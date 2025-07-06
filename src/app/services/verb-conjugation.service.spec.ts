import { TestBed } from '@angular/core/testing';
import { VerbConjugationService } from './verb-conjugation.service';

describe('VerbConjugationService', () => {
  let service: VerbConjugationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VerbConjugationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('conjugateVerb', () => {
    it('should conjugate "puhua" correctly', () => {
      expect(service.conjugateVerb('puhua', 'minä')).toBe('puhun');
      expect(service.conjugateVerb('puhua', 'sinä')).toBe('puhut');
      expect(service.conjugateVerb('puhua', 'hän')).toBe('puhua');
      expect(service.conjugateVerb('puhua', 'me')).toBe('puhumme');
      expect(service.conjugateVerb('puhua', 'te')).toBe('puhutte');
      expect(service.conjugateVerb('puhua', 'he')).toBe('puhuvat');
    });

    it('should conjugate "syödä" correctly', () => {
      expect(service.conjugateVerb('syödä', 'minä')).toBe('syön');
      expect(service.conjugateVerb('syödä', 'sinä')).toBe('syöt');
      expect(service.conjugateVerb('syödä', 'hän')).toBe('syödä');
      expect(service.conjugateVerb('syödä', 'me')).toBe('syömme');
      expect(service.conjugateVerb('syödä', 'te')).toBe('syötte');
      expect(service.conjugateVerb('syödä', 'he')).toBe('syövät');
    });
  });

  describe('validateAnswers', () => {
    it('should validate correct answers', () => {
      const answers = ['puhun', 'puhut', 'puhua', 'puhumme', 'puhutte', 'puhuvat'];
      const results = service.validateAnswers('puhua', answers);
      
      expect(results.length).toBe(6);
      expect(results.every(r => r.correct)).toBe(true);
    });

    it('should identify incorrect answers', () => {
      const answers = ['puhun', 'puhut', 'puhua', 'wrong', 'puhutte', 'puhuvat'];
      const results = service.validateAnswers('puhua', answers);
      
      expect(results[3].correct).toBe(false);
      expect(results[3].expected).toBe('puhumme');
    });
  });

  describe('calculateScore', () => {
    it('should calculate 100% for all correct', () => {
      const results = [
        { correct: true, expected: 'puhun', userAnswer: 'puhun' },
        { correct: true, expected: 'puhut', userAnswer: 'puhut' },
        { correct: true, expected: 'puhua', userAnswer: 'puhua' },
        { correct: true, expected: 'puhumme', userAnswer: 'puhumme' },
        { correct: true, expected: 'puhutte', userAnswer: 'puhutte' },
        { correct: true, expected: 'puhuvat', userAnswer: 'puhuvat' }
      ];
      
      expect(service.calculateScore(results)).toBe(100);
    });

    it('should calculate 50% for half correct', () => {
      const results = [
        { correct: true, expected: 'puhun', userAnswer: 'puhun' },
        { correct: true, expected: 'puhut', userAnswer: 'puhut' },
        { correct: true, expected: 'puhua', userAnswer: 'puhua' },
        { correct: false, expected: 'puhumme', userAnswer: 'wrong' },
        { correct: false, expected: 'puhutte', userAnswer: 'wrong' },
        { correct: false, expected: 'puhuvat', userAnswer: 'wrong' }
      ];
      
      expect(service.calculateScore(results)).toBe(50);
    });
  });
}); 
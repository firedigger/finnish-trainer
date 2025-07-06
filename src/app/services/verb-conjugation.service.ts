import { Injectable, inject } from '@angular/core';
import { ExerciseDbService } from './exercise-db.service';

export interface ConjugationResult {
  correct: boolean;
  expected: string;
  userAnswer: string;
}

@Injectable({
  providedIn: 'root'
})
export class VerbConjugationService {
  private readonly db = inject(ExerciseDbService);

  async validateAnswers(verb: string, answers: string[]): Promise<ConjugationResult[]> {
    const conjugation = await this.db.getVerbConjugation(verb);
    const results: ConjugationResult[] = [];
    if (!conjugation) {
      // If not found, mark all as incorrect and expected as empty
      return answers.map(userAnswer => ({
        correct: false,
        expected: '',
        userAnswer
      }));
    }
    for (let i = 0; i < answers.length; i++) {
      const expected = conjugation.forms[i] || '';
      const userAnswer = answers[i].trim().toLowerCase();
      const correct = userAnswer === expected.toLowerCase();
      results.push({
        correct,
        expected,
        userAnswer: answers[i]
      });
    }
    return results;
  }

  calculateScore(results: ConjugationResult[]): number {
    const correctCount = results.filter(r => r.correct).length;
    return Math.round((correctCount / results.length) * 100);
  }
}
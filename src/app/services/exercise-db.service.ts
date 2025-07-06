import Dexie, { Table } from 'dexie';
import { Injectable } from '@angular/core';

export interface ExerciseAttempt {
  id?: number;
  verb: string;
  answers: string[];
  correctAnswers: string[];
  score: number;
  timestamp: Date;
  isComplete: boolean;
}

export interface VerbConjugation {
  verb: string;
  forms: string[]; // One form per pronoun, in order
}

export class ExerciseDatabase extends Dexie {
  exerciseAttempts!: Table<ExerciseAttempt>;
  verbConjugations!: Table<VerbConjugation>;

  constructor() {
    super('FinnishTrainerDB');
    this.version(1).stores({
      exerciseAttempts: '++id, verb, timestamp, isComplete'
    });
    this.version(2).stores({
      verbConjugations: 'verb'
    });
  }
}

@Injectable({
  providedIn: 'root'
})
export class ExerciseDbService {
  private db = new ExerciseDatabase();

  async saveAttempt(attempt: Omit<ExerciseAttempt, 'id'>): Promise<number> {
    return await this.db.exerciseAttempts.add(attempt);
  }

  async getAttemptsForVerb(verb: string): Promise<ExerciseAttempt[]> {
    return await this.db.exerciseAttempts
      .where('verb')
      .equals(verb)
      .reverse()
      .sortBy('timestamp');
  }

  async getRecentAttempts(limit: number = 10): Promise<ExerciseAttempt[]> {
    return await this.db.exerciseAttempts
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async getStatsForVerb(verb: string): Promise<{ total: number; averageScore: number }> {
    const attempts = await this.getAttemptsForVerb(verb);
    const total = attempts.length;
    const averageScore = total > 0 
      ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) / total 
      : 0;
    
    return { total, averageScore };
  }

  async saveVerbConjugation(conjugation: VerbConjugation): Promise<void> {
    await this.db.verbConjugations.put(conjugation);
  }

  async getVerbConjugation(verb: string): Promise<VerbConjugation | undefined> {
    return await this.db.verbConjugations.get(verb);
  }
}
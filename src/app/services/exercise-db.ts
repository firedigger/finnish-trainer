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

export interface Verb {
  verb: string;
}

export class ExerciseDatabase extends Dexie {
  exerciseAttempts!: Table<ExerciseAttempt>;
  verbConjugations!: Table<VerbConjugation>;
  verbs!: Table<Verb>;

  constructor() {
    super('FinnishTrainerDB');
    this.version(1).stores({
      exerciseAttempts: '++id, verb, timestamp, isComplete'
    });
    this.version(2).stores({
      verbConjugations: 'verb'
    });
    this.version(3).stores({
      verbs: 'verb'
    });
  }
}

export const db = new ExerciseDatabase();
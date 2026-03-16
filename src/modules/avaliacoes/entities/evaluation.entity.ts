import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { EvaluationCriterion } from './evaluation-criterion.entity';
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';
import { User } from '../../users/entities/user.entity';

export enum EvaluationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum EvaluationType {
  QUARTERLY = 'quarterly',
  ANNUAL = 'annual',
  PROBATIONARY = 'probationary',
  PERFORMANCE = 'performance',
}

@Entity('evaluations')
export class Evaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tecnico_id' })
  tecnicoId: string;

  @ManyToOne(() => Tecnico, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: any;

  @Column({ name: 'evaluator_id' })
  evaluatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: any;

  @Column({ name: 'reviewer_id', nullable: true })
  reviewerId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: any;

  @Column({
    type: 'enum',
    enum: EvaluationType,
    default: EvaluationType.QUARTERLY,
  })
  type: EvaluationType;

  @Column({
    type: 'enum',
    enum: EvaluationStatus,
    default: EvaluationStatus.DRAFT,
  })
  status: EvaluationStatus;

  @Column({ type: 'int', nullable: true })
  quarter: number;

  @Column({ type: 'int', nullable: true })
  year: number;

  @Column({ type: 'date' })
  evaluationDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  totalScore: number;

  @Column({ type: 'text', nullable: true })
  generalComments: string;

  @Column({ type: 'text', nullable: true })
  strengths: string;

  @Column({ type: 'text', nullable: true })
  improvements: string;

  @Column({ type: 'text', nullable: true })
  goals: string;

  @Column({ type: 'date', nullable: true })
  submittedAt: Date;

  @Column({ type: 'date', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewComments: string;

  @OneToMany(() => EvaluationCriterion, (criterion) => criterion.evaluation, {
    cascade: true,
    eager: true,
  })
  criteria: EvaluationCriterion[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

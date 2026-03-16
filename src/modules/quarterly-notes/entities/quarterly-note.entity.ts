import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Tecnico } from '../../tecnicos/entities/tecnico.entity';
import { User } from '../../users/entities/user.entity';

@Entity('quarterly_notes')
export class QuarterlyNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tecnico_id' })
  tecnicoId: string;

  @ManyToOne(() => Tecnico, (tecnico: any) => tecnico.quarterlyNotes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico: any;

  @Column({ name: 'evaluator_id' })
  evaluatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: any;

  @Column({ type: 'int' })
  quarter: number;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'jsonb', nullable: true })
  breakdown: {
    categoryId: string;
    categoryName: string;
    score: number;
    maxScore: number;
    weight: number;
  }[];

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

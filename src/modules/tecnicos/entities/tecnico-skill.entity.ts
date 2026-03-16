import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tecnico } from './tecnico.entity';

@Entity('tecnico_skills')
export class TecnicoSkill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tecnicoId: string;

  @ManyToOne(() => Tecnico, (tecnico) => tecnico.skills, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tecnicoId' })
  tecnico: Tecnico;

  @Column()
  skillId: string;

  @ManyToOne('Skill', { eager: true })
  @JoinColumn({ name: 'skillId' })
  skill: any;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  score: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('skills')
export class Skill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  category: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  machineId: string;

  @ManyToOne('Machine', (machine: any) => machine.skills)
  @JoinColumn({ name: 'machineId' })
  machine: any;

  @Column()
  teamId: string;

  @ManyToOne('Team')
  @JoinColumn({ name: 'teamId' })
  team: any;

  @Column({ nullable: true })
  subtimeId?: string;

  @ManyToOne('SubTeam')
  @JoinColumn({ name: 'subtimeId' })
  subtime: any;

  @Column({ type: 'varchar', nullable: true })
  level?: string;

  @Column({ type: 'jsonb', default: [] })
  requirements?: string[];

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

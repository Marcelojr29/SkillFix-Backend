import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  teamId: string;

  @ManyToOne('Team')
  @JoinColumn({ name: 'teamId' })
  team: any;

  @Column({ type: 'varchar', nullable: true })
  manufacturer?: string;

  @Column({ type: 'varchar', nullable: true })
  model?: string;

  @Column({ type: 'date', nullable: true })
  installationDate?: Date;

  @Column({ default: true })
  status: boolean;

  @OneToMany('Skill', (skill: any) => skill.machine)
  skills: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

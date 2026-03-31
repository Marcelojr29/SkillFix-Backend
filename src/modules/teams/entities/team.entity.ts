import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  department: string;

  @Column()
  supervisorId: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'supervisorId' })
  supervisor: any;

  @Column({ nullable: true })
  managerId?: string;

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'managerId' })
  manager?: any;

  // NOVO: Campo para registrar quem criou o time
  @Column({ name: 'created_by', nullable: true })
  createdById?: string;

  @ManyToOne('User')
  @JoinColumn({ name: 'created_by' })
  createdBy?: any;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true })
  color?: string;

  @OneToMany('SubTeam', (subteam: any) => subteam.team)
  subtimes: any[];

  @OneToMany('Tecnico', (tecnico: any) => tecnico.team)
  tecnicos: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

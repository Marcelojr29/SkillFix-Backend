import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('subtimes')
export class SubTeam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  parentTeamId: string;

  @ManyToOne(() => require('../../teams/entities/team.entity').Team, (team: any) => team.subtimes)
  @JoinColumn({ name: 'parentTeamId' })
  team: any;

  @Column({ nullable: true })
  coordenadorId?: string;

  @ManyToOne(() => require('../../tecnicos/entities/tecnico.entity').Tecnico, { nullable: true })
  @JoinColumn({ name: 'coordenadorId' })
  coordenador?: any;

  @Column({ type: 'jsonb', default: [] })
  functions: {
    id: string;
    name: string;
    description: string;
    responsibilities: string[];
  }[];

  @Column({ type: 'jsonb', default: [] })
  evaluationCriteria: {
    id: string;
    name: string;
    description: string;
    weight: number;
    maxScore: number;
  }[];

  @OneToMany('Tecnico', (tecnico: any) => tecnico.subtime)
  tecnicos: any[];

  @Column({ default: true })
  status: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

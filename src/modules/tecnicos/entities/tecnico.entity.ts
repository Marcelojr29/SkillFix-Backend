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

export enum Shift {
  PRIMEIRO = '1T',
  SEGUNDO = '2T',
  TERCEIRO = '3T',
  ADMINISTRATIVO = 'ADM',
}

export enum Gender {
  MASCULINO = 'M',
  FEMININO = 'F',
  OUTRO = 'O',
}

export enum Area {
  PRODUCAO = 'Produção',
  MANUTENCAO = 'Manutenção',
  QUALIDADE = 'Qualidade',
  ENGENHARIA = 'Engenharia',
  LOGISTICA = 'Logística',
  ADMINISTRATIVA = 'Administrativa',
  OUTRO = 'Outro',
}

export enum Senioridade {
  AUXILIAR = 'Auxiliar',
  JUNIOR = 'Junior',
  PLENO = 'Pleno',
  SENIOR = 'Sênior',
  ESPECIALISTA = 'Especialista',
  COORDENADOR = 'Coordenador',
  SUPERVISOR = 'Supervisor',
}

@Entity('tecnicos')
export class Tecnico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: Shift })
  workday: Shift;

  @Column()
  cargo: string;

  @Column({ type: 'enum', enum: Senioridade })
  senioridade: Senioridade;

  @Column({ type: 'enum', enum: Area })
  area: Area;

  @Column({ type: 'enum', enum: Shift })
  shift: Shift;

  @Column()
  department: string;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ nullable: true })
  photo?: string;

  @Column({ type: 'date' })
  joinDate: Date;

  @Column({ default: true })
  status: boolean;

  @Column({ nullable: true })
  teamId?: string;

  @ManyToOne('Team', (team: any) => team.tecnicos, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team?: any;

  @Column({ nullable: true })
  subtimeId?: string;

  @ManyToOne('SubTeam', (subtime: any) => subtime.tecnicos, { nullable: true })
  @JoinColumn({ name: 'subtimeId' })
  subtime?: any;

  @OneToMany('TecnicoSkill', (tecnicoSkill: any) => tecnicoSkill.tecnico, {
    cascade: true,
  })
  skills: any[];

  @OneToMany('QuarterlyNote', (note: any) => note.tecnico, { cascade: true })
  quarterlyNotes: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

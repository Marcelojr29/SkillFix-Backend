import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  MASTER = 'master',
  SUPERVISOR = 'supervisor',
  COORDENADOR = 'coordenador',
}

export enum Workday {
  DIURNO = 'diurno',
  NOTURNO = 'noturno',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MASTER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: Workday,
    nullable: true,
  })
  workday?: Workday;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  @Column({ nullable: true })
  @Exclude()
  refreshToken?: string;

  @Column({ name: 'tecnico_id', nullable: true })
  tecnicoId?: string;

  @OneToOne('Tecnico', { nullable: true })
  @JoinColumn({ name: 'tecnico_id' })
  tecnico?: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

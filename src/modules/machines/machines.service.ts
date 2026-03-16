import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from './entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { QueryMachineDto } from './dto/query-machine.dto';

@Injectable()
export class MachinesService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepository: Repository<Machine>,
  ) {}

  async create(createMachineDto: CreateMachineDto): Promise<Machine> {
    const existing = await this.machinesRepository.findOne({
      where: { code: createMachineDto.code },
    });

    if (existing) {
      throw new ConflictException('Código de máquina já existe');
    }

    const machine = this.machinesRepository.create(createMachineDto);
    return this.machinesRepository.save(machine);
  }

  async findAll(query: QueryMachineDto): Promise<Machine[]> {
    const { search, teamId, status = true } = query;
    const queryBuilder = this.machinesRepository.createQueryBuilder('machine');

    if (search) {
      queryBuilder.andWhere(
        '(machine.name ILIKE :search OR machine.code ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (teamId) {
      queryBuilder.andWhere('machine.teamId = :teamId', { teamId });
    }

    if (status !== undefined) {
      queryBuilder.andWhere('machine.status = :status', { status });
    }

    return queryBuilder
      .leftJoinAndSelect('machine.team', 'team')
      .leftJoinAndSelect('machine.skills', 'skills')
      .orderBy('machine.name', 'ASC')
      .getMany();
  }

  async findOne(id: string): Promise<Machine> {
    const machine = await this.machinesRepository.findOne({
      where: { id },
      relations: ['team', 'skills'],
    });

    if (!machine) {
      throw new NotFoundException(`Máquina com ID ${id} não encontrada`);
    }

    return machine;
  }

  async update(id: string, updateMachineDto: UpdateMachineDto): Promise<Machine> {
    const machine = await this.findOne(id);

    if (updateMachineDto.code && updateMachineDto.code !== machine.code) {
      const existing = await this.machinesRepository.findOne({
        where: { code: updateMachineDto.code },
      });
      if (existing) {
        throw new ConflictException('Código de máquina já existe');
      }
    }

    Object.assign(machine, updateMachineDto);
    return this.machinesRepository.save(machine);
  }

  async remove(id: string): Promise<{ message: string }> {
    const machine = await this.findOne(id);
    machine.status = false;
    await this.machinesRepository.save(machine);
    return { message: 'Máquina desativada com sucesso' };
  }
}

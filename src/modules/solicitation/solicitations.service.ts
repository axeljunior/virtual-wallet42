import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { SolicitationEntity } from '../../providers/database/entities/solicitation.entity';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';

@Injectable()
export class SolicitationsService {

    constructor(@InjectRepository(SolicitationEntity)
        private readonly solicitationRepository: Repository<SolicitationEntity>,
        private readonly userService: UsersService) { }

    getSolicitationById(solicitationId: string) {
        const solicitation = this.solicitationRepository.findOne({ where: { id: solicitationId } });
        if (!solicitation) {
            throw new NotFoundException('Solicitation not found');
        }
        return solicitation;
    }

    updateSolicitationStatus(solicitationId: string, status: ESolicitationStatus) {
        return this.solicitationRepository.update(solicitationId, { status });
    }
}

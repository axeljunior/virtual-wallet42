import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { SolicitationEntity } from '../../providers/database/entities/solicitation.entity';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';
import { ETransactionType } from '../../commons/enums/transferencia-type.enum';
import { err, ok } from 'tryless';

@Injectable()
export class SolicitationsService {

    constructor(@InjectRepository(SolicitationEntity)
        private readonly solicitationRepository: Repository<SolicitationEntity>,
        private readonly userService: UsersService) { }

    async createSolicitation(transferencia: TransactionEntity) {
        const newSolicitation = this.solicitationRepository.create({
            transaction: transferencia,
            status: ESolicitationStatus.PENDING,
            type: ETransactionType.TRANSFER
        });

        try {
            await this.solicitationRepository.save(newSolicitation);

        } catch (e) {
            Logger.error(`Error creating solicitation: ${e.message}`, ' SolicitationsService');
            return err(" Solicitation created: DatabaseError", 'Erro ao criar solicitação');
        }

        return ok()
    }

    async getSolicitationById(solicitationId: string) {
        const solicitation = await this.solicitationRepository.findOne({ where: { id: solicitationId }, relations: ['transaction'] });

        if (!solicitation) {
            return err("SolicitationNotFound", 'Solicitação não encontrada');
        }
        return ok(solicitation);
    }

    updateSolicitationStatus(solicitationId: string, status: ESolicitationStatus) {
        return this.solicitationRepository.update(solicitationId, { status });
    }
}

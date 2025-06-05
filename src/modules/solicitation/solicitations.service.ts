import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TransactionEntity } from '../../providers/database/entities/transaction.entity';
import { SolicitationEntity } from '../../providers/database/entities/solicitation.entity';
import { ESolicitationStatus } from '../../commons/enums/solicitations-status.enum';
import { ETransactionType } from '../../commons/enums/transferencia-type.enum';

@Injectable()
export class SolicitationsService {

    constructor(@InjectRepository(SolicitationEntity)
        private readonly solicitationRepository: Repository<SolicitationEntity>) { }

    async createSolicitation(transferencia: TransactionEntity) {
        const newSolicitation = this.solicitationRepository.create({
            transaction: transferencia,
            status: ESolicitationStatus.PENDING,
            type: ETransactionType.TRANSFER
        });

        try {
            await this.solicitationRepository.save(newSolicitation);

        } catch (e) {
            Logger.error(`Erro ao criar solicitação: ${e.message}`, ' SolicitationsService');
            throw new InternalServerErrorException('DatabaseError: Erro ao criar solicitação');
        }
    }

    async getSolicitationById(solicitationId: string) {
        const solicitation = await this.solicitationRepository.findOne({ where: { id: solicitationId }, relations: ['transaction'] });

        if (!solicitation) {
            throw new NotFoundException('Solicitação não encontrada')
        }

        return solicitation;
    }

    updateSolicitationStatus(solicitationId: string, status: ESolicitationStatus) {
        try {
            return this.solicitationRepository.update(solicitationId, { status });
        } catch (e) {
            Logger.error(`Erro ao atualizar status da solicitação: ${e.message}`, ' SolicitationsService');
            throw new InternalServerErrorException('DatabaseError: Erro ao atualizar status da solicitação');
        }
    }
}

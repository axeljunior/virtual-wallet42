import { LoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectPinoLogger, PinoLogger } from "nestjs-pino";

export class CustomLogger implements LoggerService {
    private static contextRules: Record<string, number> = {};
    private readonly LOG_LEVEL_MAP: Record<string, number> = {
        trace: 0,
        debug: 1,
        info: 2,
        warn: 3,
        error: 4
    };

    constructor(
        @InjectPinoLogger()
        private readonly logger: PinoLogger,
        private readonly configService: ConfigService
    ) {
        if(Object.keys(CustomLogger.contextRules).length === 0) {
            this.initializeContextRules();
        }
    }

    verbose(message: string, context?: string) {
        this.logger.trace({ context }, message)
    }

    debug(message: string, context?: string) {
        this.logger.debug({ context }, message)
    }

    log(message: string, context?: string) {
        this.logger.info({ msg: message })
    }

    warn(message: string, context?: string) {
        this.logger.warn({ context }, message)
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.error({ context, trace }, message)
    }

    private initializeContextRules() {
        const rules = this.configService.get('api.logRule')
        if(!rules)  {
            CustomLogger.contextRules['*'] = this.LOG_LEVEL_MAP["error"]
        }
    }
}
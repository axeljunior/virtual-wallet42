// users/listeners/user-created.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { SendConfirmationEmailEvent } from './send-confirmation-email.event';

@Injectable()
export class SendConfirmationEmailListener {

  @OnEvent('user.createdSendEmail')
  handleSendConfirmationEmailEvent(event: SendConfirmationEmailEvent) {
    console.log('Disparando email de boas-vindas para:', event.newUser?.email);

    // Simular envio de email
    // this.emailService.sendWelcome(event.email);
  }
}
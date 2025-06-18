import { UserEntity } from "src/providers/database/entities/user.entity";

export class SendConfirmationEmailEvent {
  constructor(public readonly newUser: Partial<UserEntity>) {}
}
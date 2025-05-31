import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, Matches } from 'class-validator';

import { passwordValidation } from '../constants/regex';
import { IUser } from '../../users/dto/user.dto';

  // @ApiProperty({ type: String })
  // @ValidateIf(schema => schema.tipoImovel)
  // @IsString()
  // tipoImovel: string;

export class CreateTransactionDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  value: number; // Transferred amount

  @ApiProperty({ example: 'pending | completed | failed | cancelled' })
  @IsNotEmpty()
  @IsString()
  status: string; // Current status of the transaction

  @ApiProperty({ type: IUser })
  @IsObject()
  sender: IUser;

  @ApiProperty({ type: IUser })
  @IsObject()
  receiver: IUser;
}
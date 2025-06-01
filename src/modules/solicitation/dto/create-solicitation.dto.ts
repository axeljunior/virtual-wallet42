import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, Matches } from 'class-validator';

export class CreateSolicitationDto {

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  value: number; // Transferred amount

  @ApiProperty()
  @IsObject()
  receiverEmail: string;
}
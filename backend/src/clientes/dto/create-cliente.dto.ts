import { IsString, IsEmail, Length } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @Length(3, 100)
  nome: string;

  @IsString()
  @Length(11, 11)
  cpf: string;

  @IsString()
  cnh: string;

  @IsString()
  telefone: string;

  @IsEmail()
  email: string;
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UtilisateurService } from '../services/utilisateur.service';
import { CreateUtilisateurDto } from '../dtos/create-utilisateur.dto';
import { UpdateUtilisateurDto } from '../dtos/update-utilisateur.dto';
import { UtilisateurResponseDto } from '../dtos/utilisateur-response.dto';

@Controller('utilisateurs')
export class UtilisateurController {
  constructor(private utilisateurService: UtilisateurService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUtilisateurDto: CreateUtilisateurDto): Promise<UtilisateurResponseDto> {
    return this.utilisateurService.create(createUtilisateurDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<UtilisateurResponseDto[]> {
    return this.utilisateurService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@Param('id') id: string): Promise<UtilisateurResponseDto> {
    return this.utilisateurService.findById(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateUtilisateurDto: UpdateUtilisateurDto,
  ): Promise<UtilisateurResponseDto> {
    return this.utilisateurService.update(id, updateUtilisateurDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.utilisateurService.remove(id);
  }
}

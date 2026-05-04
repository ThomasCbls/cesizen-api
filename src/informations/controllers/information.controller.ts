import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/guards/roles.guard'
import { Roles } from '../../auth/decorators/roles.decorator'
import { CreateInformationDto } from '../dtos/create-information.dto'
import { UpdateInformationDto } from '../dtos/update-information.dto'
import { InformationResponseDto } from '../dtos/information-response.dto'
import { InformationService } from '../services/information.service'

@Controller('informations')
export class InformationController {
  constructor(private readonly informationService: InformationService) {}

  // Routes publiques (accessible à tous)
  @Get()
  async findAll(@Query('type') type?: string): Promise<InformationResponseDto[]> {
    if (type) {
      return this.informationService.findByType(type)
    }
    return this.informationService.findAll()
  }

  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string): Promise<InformationResponseDto> {
    return this.informationService.findBySlug(slug)
  }

  @Get(':id')
  async findById(@Param('id', ParseIntPipe) id: number): Promise<InformationResponseDto> {
    return this.informationService.findById(id)
  }

  // Routes d'administration (réservées aux admins)
  @Get('admin/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAllForAdmin(): Promise<InformationResponseDto[]> {
    return this.informationService.findAllForAdmin()
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Body() createInformationDto: CreateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationService.create(createInformationDto)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInformationDto: UpdateInformationDto,
  ): Promise<InformationResponseDto> {
    return this.informationService.update(id, updateInformationDto)
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deactivate(@Param('id', ParseIntPipe) id: number): Promise<InformationResponseDto> {
    return this.informationService.deactivate(id)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.informationService.remove(id)
  }
}

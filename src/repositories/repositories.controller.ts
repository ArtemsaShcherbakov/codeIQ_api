import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { parseCreateRepositoryDto } from './dto/create-repository.dto';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post()
  create(@Body() body: unknown) {
    const dto = parseCreateRepositoryDto(body);
    return this.repositoriesService.create(dto);
  }

  @Get()
  findAll() {
    return this.repositoriesService.findAll();
  }

  @Get(':id/changes/latest')
  getLatestChanges(@Param('id', ParseUUIDPipe) id: string) {
    return this.repositoriesService.getLatestChanges(id);
  }
}

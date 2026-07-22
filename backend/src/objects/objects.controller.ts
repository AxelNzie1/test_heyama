import { Controller, Get, Post, Put, Delete, Param, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ObjectsService } from './objects.service';
import { CreateObjectDto } from './dto/create-object.dto';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imageFile'))
  async create(
    @Body() createObjectDto: CreateObjectDto,
    @UploadedFile() imageFile: any,
  ) {
    if (!imageFile) {
      throw new BadRequestException('Image file is required');
    }
    return this.objectsService.create(createObjectDto, imageFile);
  }

  @Get()
  async findAll() {
    return this.objectsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.objectsService.findOne(id);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('imageFile'))
  async update(
    @Param('id') id: string,
    @Body() updateObjectDto: CreateObjectDto,
    @UploadedFile() imageFile?: any,
  ) {
    return this.objectsService.update(id, updateObjectDto, imageFile);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.objectsService.delete(id);
    return { message: 'Object deleted successfully' };
  }
}

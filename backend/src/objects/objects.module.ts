import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { ObjectEntity, ObjectEntitySchema } from './object.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ObjectEntity.name, schema: ObjectEntitySchema }]),
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService],
  exports: [ObjectsService],
})
export class ObjectsModule {}

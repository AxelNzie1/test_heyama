import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ObjectEntity {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ required: true })
  imageUrl!: string;

  @Prop({ default: Date.now })
  createdAt!: Date;
}

export type ObjectDocument = ObjectEntity & Document;
export const ObjectEntitySchema = SchemaFactory.createForClass(ObjectEntity);

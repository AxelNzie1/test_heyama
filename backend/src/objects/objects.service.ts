import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectEntity, ObjectDocument } from './object.schema';
import { CreateObjectDto } from './dto/create-object.dto';
import { S3 } from 'aws-sdk';

@Injectable()
export class ObjectsService {
  private s3: S3;
  private bucket: string;
  private publicEndpoint: string;

  constructor(
    @InjectModel(ObjectEntity.name) private objectModel: Model<ObjectDocument>,
    private configService: ConfigService,
  ) {
    this.bucket = this.configService.get<string>('R2_BUCKET') || '';
    this.publicEndpoint = this.configService.get<string>('R2_PUBLIC_ENDPOINT') || '';
    this.s3 = new S3({
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      accessKeyId: this.configService.get<string>('R2_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('R2_SECRET_ACCESS_KEY'),
      region: 'auto',
    });
  }

  async create(createObjectDto: CreateObjectDto, imageFile: any): Promise<ObjectEntity> {
    const imageUrl = await this.uploadToR2(imageFile);
    const createdObject = new this.objectModel({
      ...createObjectDto,
      imageUrl,
    });
    return createdObject.save();
  }

  async findAll(): Promise<ObjectEntity[]> {
    return this.objectModel.find().exec();
  }

  async findOne(id: string): Promise<ObjectEntity> {
    const object = await this.objectModel.findById(id).exec();
    if (!object) {
      throw new NotFoundException(`Object with id "${id}" not found`);
    }
    return object;
  }

  async update(id: string, updateObjectDto: CreateObjectDto, imageFile?: any): Promise<ObjectEntity> {
    const object = await this.objectModel.findById(id);
    if (!object) {
      throw new NotFoundException(`Object with id "${id}" not found`);
    }

    const updateData: any = { ...updateObjectDto };

    if (imageFile) {
      await this.deleteFromR2(object.imageUrl);
      updateData.imageUrl = await this.uploadToR2(imageFile);
    }

    const updated = await this.objectModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    if (!updated) {
      throw new NotFoundException(`Object with id "${id}" not found`);
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const object = await this.objectModel.findById(id);
    if (!object) {
      throw new NotFoundException(`Object with id "${id}" not found`);
    }
    await this.deleteFromR2(object.imageUrl);
    await this.objectModel.findByIdAndDelete(id);
  }

  private async uploadToR2(file: any): Promise<string> {
    const key = `objects/${Date.now()}-${file.originalname}`;
    await this.s3
      .upload({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
      })
      .promise();
    return `${this.publicEndpoint}/${key}`;
  }

  private async deleteFromR2(imageUrl: string): Promise<void> {
    const key = imageUrl.replace(`${this.publicEndpoint}/`, '');
    await this.s3
      .deleteObject({
        Bucket: this.bucket,
        Key: key,
      })
      .promise();
  }
}

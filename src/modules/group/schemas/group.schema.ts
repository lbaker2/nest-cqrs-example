import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Group extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  memberIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  maxMembers: number;

  createdAt: Date;
  updatedAt: Date;
}

export const GroupSchema = SchemaFactory.createForClass(Group);
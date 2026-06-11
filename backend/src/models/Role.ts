import { Schema, model, type InferSchemaType } from 'mongoose';

const roleSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500 },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export type RoleDoc = InferSchemaType<typeof roleSchema> & { _id: Schema.Types.ObjectId };
export const Role = model('Role', roleSchema);

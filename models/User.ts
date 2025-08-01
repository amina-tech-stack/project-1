import { Schema, model, models, Document } from "mongoose";

interface IUser extends Document {
  name: string;
  password: string;
  email: string;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
});

const User = models.User || model<IUser>("User", userSchema);

export default User;

import { Schema, model, models, Document } from "mongoose";
import bcrypt from "bcrypt";

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

// Hacher le mot de passe avant de sauvegarder
userSchema.pre("save", async function (next) {
  console.log("Exécution du middleware pre-save pour hacher le mot de passe");
  console.log("Mot de passe avant hachage :", this.password);
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
    console.log("Mot de passe après hachage :", this.password);
  }
  next();
});

const User = models.User || model<IUser>("User", userSchema);

export default User;

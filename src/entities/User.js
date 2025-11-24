import { EntitySchema } from 'typeorm';
import bcrypt from 'bcryptjs';

export class User {
  id;
  name;
  address;
  email;
  password;
  date_of_birth;
  email_verified;
  created_at;
  updated_at;

  async hashPassword() {
    if (this.password && (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$'))) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(plainPassword) {
    return await bcrypt.compare(plainPassword, this.password);
  }
}

export const UserSchema = new EntitySchema({
  name: 'User',
  target: User,
  tableName: 'users',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    name: {
      type: 'varchar',
      length: 255,
    },
    address: {
      type: 'varchar',
      length: 255,
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    password: {
      type: 'varchar',
      length: 255,
      select: false,
    },
    date_of_birth: {
      type: 'date',
      nullable: true,
    },
    email_verified: {
      type: 'boolean',
      default: false,
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
    },
    updated_at: {
      type: 'timestamp',
      updateDate: true,
    },
  },
});


import { EntitySchema } from 'typeorm';

export class OTP {
  id;
  email;
  otp;
  verified;
  created_at;
  updated_at;
}

export const OTPSchema = new EntitySchema({
  name: 'OTP',
  target: OTP,
  tableName: 'otps',
  columns: {
    id: {
      type: 'int',
      primary: true,
      generated: true,
    },
    email: {
      type: 'varchar',
      length: 255,
    },
    otp: {
      type: 'varchar',
      length: 10,
    },
    verified: {
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
  indices: [
    {
      columns: ['email', 'created_at'],
    },
  ],
});

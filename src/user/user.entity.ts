import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 255 })
  password!: string;

  @Column({ length: 15 })
  phone!: string;

  @Column({ type: 'enum', enum: ['Tenant', 'Landlord'], default: 'Tenant' })
  role!: string;
}
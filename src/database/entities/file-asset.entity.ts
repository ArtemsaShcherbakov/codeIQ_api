import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('files')
export class FileAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 1024 })
  filename: string;

  @Column({ name: 'storage_path', type: 'varchar', length: 2048 })
  storagePath: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 255, nullable: true })
  mimeType: string | null;

  @Column({ type: 'int' })
  size: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}

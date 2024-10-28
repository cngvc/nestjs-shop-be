import { Category } from 'categories/entities/category.entity';
import { IsPositive } from 'class-validator';
import { RegistryDates } from 'common/embedded/registry-dates.embedded';
import { OrderItem } from 'orders/entities/order-item.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  @IsPositive()
  price: number;

  @Column(() => RegistryDates, { prefix: false })
  registryDates: RegistryDates;

  @ManyToMany(() => Category, (category) => category.products)
  @JoinTable({ name: 'product_to_category' })
  categories: Category[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  items: OrderItem[];

  get orders() {
    return this.items.map((e) => e.order);
  }
}

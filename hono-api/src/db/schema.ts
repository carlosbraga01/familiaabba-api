import { pgTable, uuid, varchar, text, timestamp, integer, primaryKey, pgEnum, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).default('member').notNull(),
  is_active: boolean('is_active').default(true),
});

export const children = pgTable('children', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  birthdate: varchar('birthdate', { length: 20 }).notNull(),
  user_id: uuid('user_id').notNull().references(() => users.id),
});

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  date: varchar('date', { length: 30 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description').notNull(),
});

export const checkins = pgTable('checkins', {
  id: uuid('id').primaryKey().defaultRandom(),
  child_id: uuid('child_id').notNull().references(() => children.id),
  event_id: uuid('event_id').notNull().references(() => events.id),
  timestamp: varchar('timestamp', { length: 30 }).notNull(),
  user_id: uuid('user_id').notNull().references(() => users.id),
});

export const announcements = pgTable('announcements', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description').notNull(),
  created_at: varchar('created_at', { length: 30 }).notNull(),
});

export const prayers = pgTable('prayers', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  user_id: uuid('user_id'),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  created_at: varchar('created_at', { length: 30 }).notNull(),
});

export const donations = pgTable('donations', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull().references(() => users.id),
  amount: integer('amount').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  created_at: varchar('created_at', { length: 30 }).notNull(),
});

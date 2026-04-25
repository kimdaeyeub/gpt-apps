import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import crypto from 'node:crypto';

export const workout = sqliteTable('workout', {
	id: text()
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text().notNull(),
	description: text().notNull(),
	durationMinutes: integer('duration_minutes').notNull(),
	intervalSeconds: integer('interval_seconds').notNull().default(60),
	exerciseCount: integer('exercise_count').notNull(),
	exercises: text('exercises', { mode: 'json' }).$type<{ name: string }>().notNull(),
	userId: text('user_id').notNull(),
	createdAt: text('created_at').$defaultFn(() => new Date().toISOString()),
});

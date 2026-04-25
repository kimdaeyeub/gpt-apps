PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_workout` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`duration_minutes` integer NOT NULL,
	`interval_seconds` integer DEFAULT 60 NOT NULL,
	`exercise_count` integer NOT NULL,
	`exercises` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` text
);
--> statement-breakpoint
INSERT INTO `__new_workout`("id", "title", "description", "duration_minutes", "interval_seconds", "exercise_count", "exercises", "user_id", "created_at") SELECT "id", "title", "description", "duration_minutes", "interval_seconds", "exercise_count", "exercises", "user_id", "created_at" FROM `workout`;--> statement-breakpoint
DROP TABLE `workout`;--> statement-breakpoint
ALTER TABLE `__new_workout` RENAME TO `workout`;--> statement-breakpoint
PRAGMA foreign_keys=ON;

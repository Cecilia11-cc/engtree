import { pgTable, serial, varchar, integer, text, timestamp, boolean, numeric, index } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const healthCheck = pgTable("health_check", {
	id: serial().notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 用户表
export const appUser = pgTable(
  "app_user",
  {
    user_id: varchar("user_id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    student_id: varchar("student_id", { length: 50 }),
    name: varchar("name", { length: 128 }).notNull(),
    college: varchar("college", { length: 128 }),
    major: varchar("major", { length: 128 }),
    target: varchar("target", { length: 50 }).notNull().default("cet4"), // cet4, cet6, postgrad, job
    level: varchar("level", { length: 20 }).notNull().default("medium"), // low, medium, high
    weekly_hours: integer("weekly_hours").default(8),
    weekly_words: integer("weekly_words").default(160),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("app_user_student_id_idx").on(table.student_id),
  ]
);

// 学习记录表
export const studyRecord = pgTable(
  "study_record",
  {
    record_id: varchar("record_id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull().references(() => appUser.user_id),
    week: integer("week").notNull(),
    study_hours: numeric("study_hours", { precision: 5, scale: 1 }).default("0"),
    word_count: integer("word_count").default(0),
    reading_score: integer("reading_score").default(0),
    listening_score: integer("listening_score").default(0),
    writing_score: integer("writing_score").default(0),
    speaking_score: integer("speaking_score").default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("study_record_user_id_idx").on(table.user_id),
    index("study_record_user_week_idx").on(table.user_id, table.week),
  ]
);

// 任务表
export const task = pgTable(
  "task",
  {
    task_id: varchar("task_id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull().references(() => appUser.user_id),
    task_type: varchar("task_type", { length: 20 }).notNull(), // word, listening, reading, speaking, writing
    task_content: text("task_content").notNull(),
    deadline: timestamp("deadline", { withTimezone: true }),
    status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed
    score: integer("score").default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("task_user_id_idx").on(table.user_id),
    index("task_user_status_idx").on(table.user_id, table.status),
    index("task_user_type_idx").on(table.user_id, table.task_type),
  ]
);

// 单词表
export const word = pgTable(
  "word",
  {
    word_id: varchar("word_id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    word_text: varchar("word_text", { length: 200 }).notNull(),
    phonetic: varchar("phonetic", { length: 200 }),
    meaning: text("meaning").notNull(),
    example_sentence: text("example_sentence"),
    example_translation: text("example_translation"),
    category: varchar("category", { length: 50 }), // general, cs, business, medical, etc.
    difficulty: varchar("difficulty", { length: 20 }).default("medium"), // easy, medium, hard
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("word_category_idx").on(table.category),
    index("word_difficulty_idx").on(table.difficulty),
  ]
);

// 用户单词学习记录
export const userWord = pgTable(
  "user_word",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull().references(() => appUser.user_id),
    word_id: varchar("word_id", { length: 36 }).notNull().references(() => word.word_id),
    mastery: integer("mastery").default(0), // 0-5, 0=新词, 5=完全掌握
    review_count: integer("review_count").default(0),
    next_review_at: timestamp("next_review_at", { withTimezone: true }),
    is_favorite: boolean("is_favorite").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("user_word_user_id_idx").on(table.user_id),
    index("user_word_word_id_idx").on(table.word_id),
    index("user_word_next_review_idx").on(table.user_id, table.next_review_at),
  ]
);

// 资料库（藏宝阁）
export const treasure = pgTable(
  "treasure",
  {
    treasure_id: varchar("treasure_id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }).notNull(), // grammar, vocabulary, reading, listening, writing, speaking, exam, culture
    sub_category: varchar("sub_category", { length: 100 }), // 子分类，如"时态""从句"等
    content_type: varchar("content_type", { length: 30 }).notNull().default("article"), // article, video, audio, pdf, tips, exercise
    content: text("content").notNull(), // 资料正文（Markdown 格式）
    tags: text("tags"), // 逗号分隔的标签
    difficulty: varchar("difficulty", { length: 20 }).default("medium"), // beginner, easy, medium, hard, advanced
    target_exam: varchar("target_exam", { length: 50 }), // cet4, cet6, postgrad, ielts, toefl
    cover_image: varchar("cover_image", { length: 500 }), // 封面图 URL
    author: varchar("author", { length: 100 }).default("EngTree"),
    view_count: integer("view_count").default(0),
    like_count: integer("like_count").default(0),
    is_featured: boolean("is_featured").default(false), // 是否精选推荐
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
  },
  (table) => [
    index("treasure_category_idx").on(table.category),
    index("treasure_content_type_idx").on(table.content_type),
    index("treasure_difficulty_idx").on(table.difficulty),
    index("treasure_target_exam_idx").on(table.target_exam),
    index("treasure_featured_idx").on(table.is_featured),
  ]
);

// 用户资料收藏
export const userTreasure = pgTable(
  "user_treasure",
  {
    id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull().references(() => appUser.user_id),
    treasure_id: varchar("treasure_id", { length: 36 }).notNull().references(() => treasure.treasure_id),
    is_favorite: boolean("is_favorite").default(false),
    is_read: boolean("is_read").default(false),
    notes: text("notes"), // 用户笔记
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("user_treasure_user_id_idx").on(table.user_id),
    index("user_treasure_treasure_id_idx").on(table.treasure_id),
  ]
);

// 错题本
export const errorBook = pgTable(
  "error_book",
  {
    error_id: varchar("error_id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
    user_id: varchar("user_id", { length: 36 }).notNull().references(() => appUser.user_id),
    error_type: varchar("error_type", { length: 30 }).notNull(), // reading, listening, grammar, writing, word
    question: text("question").notNull(),
    user_answer: text("user_answer"),
    correct_answer: text("correct_answer"),
    analysis: text("analysis"),
    is_resolved: boolean("is_resolved").default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("error_book_user_id_idx").on(table.user_id),
    index("error_book_user_type_idx").on(table.user_id, table.error_type),
  ]
);

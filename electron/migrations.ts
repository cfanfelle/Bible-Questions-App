export const userMigrations=[
`CREATE TABLE IF NOT EXISTS schema_migrations(version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE profiles(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,avatar_id TEXT NOT NULL DEFAULT 'lamb',xp REAL NOT NULL DEFAULT 0,current_streak INTEGER NOT NULL DEFAULT 0,longest_streak INTEGER NOT NULL DEFAULT 0,last_active_date TEXT,selected_banner TEXT,created_at TEXT NOT NULL);
CREATE TABLE settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE sessions(id INTEGER PRIMARY KEY AUTOINCREMENT,profile_id INTEGER NOT NULL,mode TEXT NOT NULL,book_id TEXT,chapter_start INTEGER,chapter_end INTEGER,title TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'active',current_index INTEGER NOT NULL DEFAULT 0,question_order TEXT NOT NULL,choice_orders TEXT NOT NULL,created_at TEXT NOT NULL,completed_at TEXT,FOREIGN KEY(profile_id) REFERENCES profiles(id) ON DELETE CASCADE);
CREATE TABLE session_answers(session_id INTEGER NOT NULL,question_id TEXT NOT NULL,selected_choice INTEGER NOT NULL,correct_choice INTEGER NOT NULL,is_correct INTEGER NOT NULL,answered_at TEXT NOT NULL,PRIMARY KEY(session_id,question_id),FOREIGN KEY(session_id) REFERENCES sessions(id) ON DELETE CASCADE);
CREATE TABLE book_stats(profile_id INTEGER NOT NULL,book_id TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,best_percent REAL NOT NULL DEFAULT 0,PRIMARY KEY(profile_id,book_id));
CREATE TABLE highlights(profile_id INTEGER NOT NULL,book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse INTEGER NOT NULL,color TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(profile_id,book_id,chapter,verse));
CREATE TABLE reading_positions(profile_id INTEGER PRIMARY KEY,book_id TEXT NOT NULL,chapter INTEGER NOT NULL,updated_at TEXT NOT NULL);
CREATE TABLE daily_questions(profile_id INTEGER NOT NULL,local_date TEXT NOT NULL,question_id TEXT NOT NULL,selected_choice INTEGER,correct_choice INTEGER,is_correct INTEGER,answered_at TEXT,PRIMARY KEY(profile_id,local_date));
CREATE TABLE unlocked_banners(profile_id INTEGER NOT NULL,banner TEXT NOT NULL,unlocked_at TEXT NOT NULL,PRIMARY KEY(profile_id,banner));
CREATE INDEX idx_sessions_profile_status ON sessions(profile_id,status);`,
`ALTER TABLE profiles ADD COLUMN active_seconds INTEGER NOT NULL DEFAULT 0;`,
`CREATE TABLE verse_notes(profile_id INTEGER NOT NULL,book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse INTEGER NOT NULL,note TEXT NOT NULL,updated_at TEXT NOT NULL,PRIMARY KEY(profile_id,book_id,chapter,verse));
CREATE TABLE bookmarks(profile_id INTEGER NOT NULL,book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse INTEGER NOT NULL,created_at TEXT NOT NULL,PRIMARY KEY(profile_id,book_id,chapter,verse));`
];

export const contentSchema=`CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT NOT NULL);
CREATE TABLE books(id TEXT PRIMARY KEY,name TEXT NOT NULL,testament TEXT NOT NULL,book_order INTEGER NOT NULL UNIQUE,chapters INTEGER NOT NULL);
CREATE TABLE verses(book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse INTEGER NOT NULL,text TEXT NOT NULL,PRIMARY KEY(book_id,chapter,verse));
CREATE TABLE questions(id TEXT PRIMARY KEY,book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse_start INTEGER NOT NULL,verse_end INTEGER NOT NULL,question_text TEXT NOT NULL,answer_a TEXT NOT NULL,answer_b TEXT NOT NULL,answer_c TEXT NOT NULL,answer_d TEXT NOT NULL,correct_index INTEGER NOT NULL CHECK(correct_index BETWEEN 0 AND 3));
CREATE TABLE animals(id TEXT PRIMARY KEY,name TEXT NOT NULL,emoji TEXT NOT NULL,unlock_level INTEGER NOT NULL,sort_order INTEGER NOT NULL);`;

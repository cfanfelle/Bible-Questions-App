import Database from './db.js';
import { contentSchema } from './migrations.js';
import fs from 'node:fs';

export const BOOKS:[string,string,'OT'|'NT',number][]=[
['GEN','Genesis','OT',50],['EXO','Exodus','OT',40],['LEV','Leviticus','OT',27],['NUM','Numbers','OT',36],['DEU','Deuteronomy','OT',34],['JOS','Joshua','OT',24],['JDG','Judges','OT',21],['RUT','Ruth','OT',4],['1SA','1 Samuel','OT',31],['2SA','2 Samuel','OT',24],['1KI','1 Kings','OT',22],['2KI','2 Kings','OT',25],['1CH','1 Chronicles','OT',29],['2CH','2 Chronicles','OT',36],['EZR','Ezra','OT',10],['NEH','Nehemiah','OT',13],['EST','Esther','OT',10],['JOB','Job','OT',42],['PSA','Psalms','OT',150],['PRO','Proverbs','OT',31],['ECC','Ecclesiastes','OT',12],['SNG','Song of Solomon','OT',8],['ISA','Isaiah','OT',66],['JER','Jeremiah','OT',52],['LAM','Lamentations','OT',5],['EZK','Ezekiel','OT',48],['DAN','Daniel','OT',12],['HOS','Hosea','OT',14],['JOL','Joel','OT',3],['AMO','Amos','OT',9],['OBA','Obadiah','OT',1],['JON','Jonah','OT',4],['MIC','Micah','OT',7],['NAM','Nahum','OT',3],['HAB','Habakkuk','OT',3],['ZEP','Zephaniah','OT',3],['HAG','Haggai','OT',2],['ZEC','Zechariah','OT',14],['MAL','Malachi','OT',4],['MAT','Matthew','NT',28],['MRK','Mark','NT',16],['LUK','Luke','NT',24],['JHN','John','NT',21],['ACT','Acts','NT',28],['ROM','Romans','NT',16],['1CO','1 Corinthians','NT',16],['2CO','2 Corinthians','NT',13],['GAL','Galatians','NT',6],['EPH','Ephesians','NT',6],['PHP','Philippians','NT',4],['COL','Colossians','NT',4],['1TH','1 Thessalonians','NT',5],['2TH','2 Thessalonians','NT',3],['1TI','1 Timothy','NT',6],['2TI','2 Timothy','NT',4],['TIT','Titus','NT',3],['PHM','Philemon','NT',1],['HEB','Hebrews','NT',13],['JAS','James','NT',5],['1PE','1 Peter','NT',5],['2PE','2 Peter','NT',3],['1JN','1 John','NT',5],['2JN','2 John','NT',1],['3JN','3 John','NT',1],['JUD','Jude','NT',1],['REV','Revelation','NT',22]
];

const WEB_BOOK_IDS:Record<string,string>={SOL:'SNG',EZE:'EZK',JOE:'JOL',MAR:'MRK',JOH:'JHN',PHI:'PHP',JAM:'JAS','1JO':'1JN','2JO':'2JN','3JO':'3JN'};
export const TRANSLATIONS=[
 {id:'BSB',name:'Berean Standard Bible',abbreviation:'BSB',description:'Modern and balanced',license:'Public Domain',sortOrder:1},
 {id:'WEB',name:'World English Bible',abbreviation:'WEB',description:'Formal modern English',license:'Public Domain',sortOrder:2},
 {id:'KJV',name:'King James Version',abbreviation:'KJV',description:'Traditional English',license:'Public Domain outside the United Kingdom',sortOrder:3}
] as const;
export interface BibleSource {translationId:string;file:string}

const QUESTIONS:[string,string,number,number,number,string,string,string,string,string,number][]=[
 ['GEN-000001','GEN',1,9,13,'What did God create on the third day?','The sun and the moon','Land and seas','Birds and fish','Man and animals',1],
 ['GEN-000002','GEN',1,1,5,'What did God create on the first day?','The sky','Light','Land and seas','The sun and moon',1],
 ['GEN-000003','GEN',1,20,23,'What did God create on the fifth day?','Land animals and mankind','Plants and trees','Birds and creatures of the sea','The sun, moon, and stars',2],
 ['GEN-000004','GEN',2,7,7,'What did God form man from?','Clay from the river','Dust of the ground','Sand from the sea','Stone from the earth',1],
 ['GEN-000005','GEN',2,9,9,'What trees were in the middle of the Garden of Eden?','The tree of life and the tree of knowledge of good and evil','The tree of wisdom and the tree of life','The tree of knowledge and the tree of judgment','The tree of blessing and the tree of wisdom',0],
 ['GEN-000006','GEN',2,10,14,'What four rivers did the river watering the Garden of Eden split into?','Jordan, Nile, Tigris, and Euphrates','Pishon, Gihon, Tigris, and Euphrates','Pishon, Jordan, Nile, and Gihon','Gihon, Jordan, Tigris, and Nile',1],
 ['GEN-000007','GEN',2,16,17,'What tree did God command Adam not to eat from?','The tree of life','The tree of wisdom','The tree of knowledge of good and evil','The tree in the eastern part of the garden',2],
 ['GEN-000008','GEN',2,20,20,'Who named all the livestock, birds, and wild animals?','God','Eve','Adam','Noah',2],
 ['GEN-000009','GEN',2,22,22,'What did God make Eve with?','Dust from the ground',"Adam's rib",'Clay from the earth','A branch from the tree of life',1],
 ['GEN-000010','GEN',3,24,24,'After Adam and Eve ate from the tree of knowledge of good and evil, what did God use to guard the way to the tree of life?','Angels and a wall of fire','Cherubim and a flaming sword','A pillar of fire and a cloud','Cherubim and a wall of thorns',1],
 ['GEN-000011','GEN',3,13,13,'What animal deceived Eve into eating the forbidden fruit?','A lion','A serpent','A raven','A wolf',1],
 ['GEN-000012','GEN',4,8,8,'Who did Cain kill?','Adam','Abel','Enoch','Lamech',1],
 ['GEN-000013','GEN',4,25,25,"What was the name of Adam's third son?",'Abel','Enoch','Seth','Lamech',2],
 ['GEN-000014','GEN',5,1,1,'In whose likeness did God create man?',"Adam's","The angels'","God's","The animals'",2],
 ['GEN-000015','GEN',5,5,5,'How old was Adam when he died?','900 years old','930 years old','950 years old','969 years old',1],
 ['GEN-000016','GEN',5,24,24,'Who did not die, but was taken away by God?','Seth','Methuselah','Enoch','Noah',2],
 ['GEN-000017','GEN',5,32,32,"Who were Noah's three sons?",'Shem, Ham, and Japheth','Cain, Abel, and Seth','Enoch, Lamech, and Seth','Abraham, Nahor, and Haran',0],
 ['GEN-000018','GEN',8,4,4,"Where did Noah's ark come to rest after the waters receded?",'The mountains of Ararat','Mount Sinai','The mountains of Moab','Mount Carmel',0],
 ['GEN-000019','GEN',8,7,7,'What was the first bird Noah sent out to see how far the water had receded?','Dove','Eagle','Raven','Sparrow',2],
 ['GEN-000020','GEN',8,8,8,'What did Noah send out to see if the water had receded from the surface of the ground?','Raven','Dove','Eagle','Sparrow',1],
 ['GEN-000021','GEN',8,11,11,'What did the dove bring back to Noah the second time it returned?','A fig leaf','An olive leaf','A small branch','A cluster of grapes',1],
 ['GEN-000022','GEN',9,13,13,"What is the sign of God's covenant?",'A pillar of fire','A rainbow in the clouds','An olive branch','A star',1],
 ['GEN-000023','GEN',9,29,29,'How old was Noah when he died?','900 years old','930 years old','950 years old','969 years old',2],
 ['GEN-000024','GEN',9,22,25,'Why did Noah curse Canaan, the son of Ham?','Ham stole from Noah',"Ham saw his father's nakedness and told his brothers",'Canaan refused to obey Noah',"Ham destroyed Noah's vineyard",1],
 ['GEN-000025','GEN',10,6,6,'Who were the sons of Ham?','Cush, Egypt, Put, and Canaan','Elam, Asshur, Arpachshad, and Lud','Gomer, Magog, Madai, and Javan','Shem, Cush, Put, and Canaan',0],
 ['GEN-000026','GEN',11,1,1,'How many languages did the people of the world originally speak before the Tower of Babel?','One language','Two languages','Seven languages','Twelve languages',0],
 ['GEN-000027','GEN',11,4,9,'Why was building the Tower of Babel wrong?','The people wanted to make a name for themselves and avoid being scattered over the earth','The people built the tower on land that belonged to Noah','The people were forbidden from building with bricks','The tower was built as a temple for Noah',0],
 ['GEN-000028','GEN',11,9,9,'What does the name "Babel" mean in the context of Genesis 11?','Confusion','Great city','Tower of heaven','Scattering',0],
 ['GEN-000029','GEN',11,10,26,"From which of Noah's three sons was Abram descended?",'Ham','Japheth','Shem','Canaan',2],
 ['GEN-000030','GEN',11,27,31,'How was Lot related to Abram?',"Lot was Abram's brother","Lot was Abram's nephew","Lot was Abram's son","Lot was Abram's cousin",1],
 ['GEN-000031','GEN',12,11,13,'Why did Abram tell Sarai to say that she was his sister?','He wanted Pharaoh to give her land','He was afraid the Egyptians would kill him because of her beauty','He wanted to hide that they had come from Canaan','He was afraid Sarai would be sent back home',1],
 ['GEN-000032','GEN',13,5,9,'Why did Abram and Lot separate from each other?','They disagreed over where to build an altar','The land could not support all their possessions, and their herdsmen were quarreling','Lot wanted to return to Egypt','Abram told Lot to leave because he had disobeyed God',1],
 ['GEN-000033','GEN',16,15,15,"What was the name of Abram's first son, whom Hagar gave birth to?",'Isaac','Ishmael','Esau','Jacob',1],
 ['GEN-000034','GEN',17,9,11,'Why did God command Abraham and the males in his household to be circumcised?','As a sign of the covenant between God and Abraham','To show that Abraham was the leader of his household','As a punishment for leaving his homeland','To prepare them for entering Egypt',0],
 ['GEN-000035','GEN',17,24,25,'How old were Abraham and his son Ishmael when they were circumcised?','Abraham was 75 and Ishmael was 10','Abraham was 90 and Ishmael was 12','Abraham was 99 and Ishmael was 13','Abraham was 100 and Ishmael was 14',2]
];

export function ensureContent(path:string, bibleSources:BibleSource[]=[]){
 const db=new Database(path); db.pragma('journal_mode = WAL');
 if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='metadata'").get()){
  db.exec(contentSchema);
  const book=db.prepare('INSERT INTO books VALUES(?,?,?,?,?)'); BOOKS.forEach((b,i)=>book.run(b[0],b[1],b[2],i+1,b[3]));
  db.prepare('INSERT INTO metadata VALUES (?,?)').run('question_bank_version','1.0-sample');
  const animal=db.prepare('INSERT INTO animals VALUES(?,?,?,?,?)'); [['lamb','Lamb','🐑',1],['dove','Dove','🕊️',1],['fish','Fish','🐟',1],['donkey','Donkey','🫏',1],['goat','Goat','🐐',1],['camel','Camel','🐫',1],['eagle','Eagle','🦅',25],['deer','Deer','🦌',50],['ox','Ox','🐂',100],['lion','Lion','🦁',1000]].forEach((a,i)=>animal.run(...a,i));
  const verse=db.prepare('INSERT INTO verses VALUES(?,?,?,?,?)');
  [[1,'In the beginning, God created the heavens and the earth.'],[2,'The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters.'],[3,'God said, “Let there be light,” and there was light.'],[4,'God saw the light, and saw that it was good. God divided the light from the darkness.'],[5,'God called the light “day”, and the darkness he called “night”. There was evening and there was morning, the first day.']].forEach(v=>verse.run('BSB','GEN',1,...v));
  [[16,'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.'],[17,'For God didn’t send his Son into the world to judge the world, but that the world should be saved through him.']].forEach(v=>verse.run('BSB','JHN',3,...v));
  const q=db.prepare('INSERT INTO questions VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  q.run('GEN-000001','GEN',1,1,1,'What did God create in the beginning?','The heavens and the earth','Only the sea','The sun and moon','Humankind',0);
  q.run('GEN-000002','GEN',1,3,3,'What happened when God said, “Let there be light”?','The stars appeared','There was light','Night began','The waters divided',1);
  q.run('JHN-000001','JHN',3,16,17,'Why did God send his Son into the world?','To condemn it','To rule Rome','That the world should be saved through him','To establish an earthly kingdom',2);
 }
 const verseColumns=(db.prepare('PRAGMA table_info(verses)').all() as unknown as {name:string}[]).map(column=>column.name);
 if(!verseColumns.includes('translation_id')){
  db.transaction(()=>{
   db.exec('ALTER TABLE verses RENAME TO legacy_verses; CREATE TABLE verses(translation_id TEXT NOT NULL,book_id TEXT NOT NULL,chapter INTEGER NOT NULL,verse INTEGER NOT NULL,text TEXT NOT NULL,PRIMARY KEY(translation_id,book_id,chapter,verse)); CREATE INDEX idx_verses_location ON verses(translation_id,book_id,chapter,verse);');
   db.exec("INSERT INTO verses SELECT 'WEB',book_id,chapter,verse,text FROM legacy_verses; DROP TABLE legacy_verses;");
  })();
 }
 db.exec('CREATE TABLE IF NOT EXISTS translations(id TEXT PRIMARY KEY,name TEXT NOT NULL,abbreviation TEXT NOT NULL,description TEXT NOT NULL,license TEXT NOT NULL,sort_order INTEGER NOT NULL UNIQUE)');
 const saveTranslation=db.prepare('INSERT OR REPLACE INTO translations VALUES(?,?,?,?,?,?)');
 TRANSLATIONS.forEach(item=>saveTranslation.run(item.id,item.name,item.abbreviation,item.description,item.license,item.sortOrder));
 // Content seeding is idempotent so an interrupted first launch repairs itself.
 const repairQuestion=db.prepare('INSERT OR IGNORE INTO questions VALUES(?,?,?,?,?,?,?,?,?,?,?)');
 repairQuestion.run('GEN-000001','GEN',1,1,1,'What did God create in the beginning?','The heavens and the earth','Only the sea','The sun and moon','Humankind',0);
 repairQuestion.run('GEN-000002','GEN',1,3,3,'What happened when God said, “Let there be light”?','The stars appeared','There was light','Night began','The waters divided',1);
 repairQuestion.run('JHN-000001','JHN',3,16,17,'Why did God send his Son into the world?','To condemn it','To rule Rome','That the world should be saved through him','To establish an earthly kingdom',2);
 // The curated list is the sole source of quiz questions, including for existing installs.
 const curatedQuestion=db.prepare('INSERT OR REPLACE INTO questions VALUES(?,?,?,?,?,?,?,?,?,?,?)');
 const syncQuestions=db.transaction(()=>{db.prepare('DELETE FROM questions').run();QUESTIONS.forEach(question=>curatedQuestion.run(...question))});
 syncQuestions();
 db.prepare('INSERT OR REPLACE INTO metadata(key,value) VALUES(?,?)').run('question_bank_version','1.4-personal');
 for(const source of bibleSources){
  if(!TRANSLATIONS.some(item=>item.id===source.translationId)||!fs.existsSync(source.file))continue;
  const count=(db.prepare('SELECT COUNT(*) count FROM verses WHERE translation_id=?').get(source.translationId) as {count:number}).count;
  if(count<30000){
   const insert=db.prepare('INSERT OR REPLACE INTO verses(translation_id,book_id,chapter,verse,text) VALUES(?,?,?,?,?)');
   const importBible=db.transaction(()=>{
    db.prepare('DELETE FROM verses WHERE translation_id=?').run(source.translationId);
    for(const line of fs.readFileSync(source.file,'utf8').split(/\r?\n/)){
     if(!line)continue;
     const match=/^(\S+) (\d+):(\d+) (.*)$/.exec(line);
     if(!match)throw new Error(`Invalid ${source.translationId} verse line: ${line.slice(0,80)}`);
     insert.run(source.translationId,WEB_BOOK_IDS[match[1]]??match[1],Number(match[2]),Number(match[3]),match[4]);
    }
    db.prepare('INSERT OR REPLACE INTO metadata(key,value) VALUES(?,?)').run(`bible_version_${source.translationId}`,`${source.translationId}-2026`);
   });
   importBible();
  }
 }
 return db;
}

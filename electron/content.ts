import Database from './db.js';
import { contentSchema } from './migrations.js';
import fs from 'node:fs';

export const BOOKS:[string,string,'OT'|'NT',number][]=[
['GEN','Genesis','OT',50],['EXO','Exodus','OT',40],['LEV','Leviticus','OT',27],['NUM','Numbers','OT',36],['DEU','Deuteronomy','OT',34],['JOS','Joshua','OT',24],['JDG','Judges','OT',21],['RUT','Ruth','OT',4],['1SA','1 Samuel','OT',31],['2SA','2 Samuel','OT',24],['1KI','1 Kings','OT',22],['2KI','2 Kings','OT',25],['1CH','1 Chronicles','OT',29],['2CH','2 Chronicles','OT',36],['EZR','Ezra','OT',10],['NEH','Nehemiah','OT',13],['EST','Esther','OT',10],['JOB','Job','OT',42],['PSA','Psalms','OT',150],['PRO','Proverbs','OT',31],['ECC','Ecclesiastes','OT',12],['SNG','Song of Solomon','OT',8],['ISA','Isaiah','OT',66],['JER','Jeremiah','OT',52],['LAM','Lamentations','OT',5],['EZK','Ezekiel','OT',48],['DAN','Daniel','OT',12],['HOS','Hosea','OT',14],['JOL','Joel','OT',3],['AMO','Amos','OT',9],['OBA','Obadiah','OT',1],['JON','Jonah','OT',4],['MIC','Micah','OT',7],['NAM','Nahum','OT',3],['HAB','Habakkuk','OT',3],['ZEP','Zephaniah','OT',3],['HAG','Haggai','OT',2],['ZEC','Zechariah','OT',14],['MAL','Malachi','OT',4],['MAT','Matthew','NT',28],['MRK','Mark','NT',16],['LUK','Luke','NT',24],['JHN','John','NT',21],['ACT','Acts','NT',28],['ROM','Romans','NT',16],['1CO','1 Corinthians','NT',16],['2CO','2 Corinthians','NT',13],['GAL','Galatians','NT',6],['EPH','Ephesians','NT',6],['PHP','Philippians','NT',4],['COL','Colossians','NT',4],['1TH','1 Thessalonians','NT',5],['2TH','2 Thessalonians','NT',3],['1TI','1 Timothy','NT',6],['2TI','2 Timothy','NT',4],['TIT','Titus','NT',3],['PHM','Philemon','NT',1],['HEB','Hebrews','NT',13],['JAS','James','NT',5],['1PE','1 Peter','NT',5],['2PE','2 Peter','NT',3],['1JN','1 John','NT',5],['2JN','2 John','NT',1],['3JN','3 John','NT',1],['JUD','Jude','NT',1],['REV','Revelation','NT',22]
];

const WEB_BOOK_IDS:Record<string,string>={SOL:'SNG',EZE:'EZK',JOE:'JOL',MAR:'MRK',JOH:'JHN',PHI:'PHP',JAM:'JAS','1JO':'1JN','2JO':'2JN','3JO':'3JN'};

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
 ['JHN-000001','JHN',3,16,17,'Why did God send his Son into the world?','To condemn it','To rule Rome','That the world should be saved through him','To establish an earthly kingdom',2]
];

export function ensureContent(path:string, webVerseFile?:string){
 const db=new Database(path); db.pragma('journal_mode = WAL');
 if(!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='metadata'").get()){
  db.exec(contentSchema);
  const book=db.prepare('INSERT INTO books VALUES(?,?,?,?,?)'); BOOKS.forEach((b,i)=>book.run(b[0],b[1],b[2],i+1,b[3]));
  db.prepare('INSERT INTO metadata VALUES (?,?)').run('question_bank_version','1.0-sample');
  const animal=db.prepare('INSERT INTO animals VALUES(?,?,?,?,?)'); [['lamb','Lamb','🐑',1],['dove','Dove','🕊️',1],['fish','Fish','🐟',1],['donkey','Donkey','🫏',1],['goat','Goat','🐐',1],['camel','Camel','🐫',1],['eagle','Eagle','🦅',25],['deer','Deer','🦌',50],['ox','Ox','🐂',100],['lion','Lion','🦁',1000]].forEach((a,i)=>animal.run(...a,i));
  const verse=db.prepare('INSERT INTO verses VALUES(?,?,?,?)');
  [[1,'In the beginning, God created the heavens and the earth.'],[2,'The earth was formless and empty. Darkness was on the surface of the deep and God’s Spirit was hovering over the surface of the waters.'],[3,'God said, “Let there be light,” and there was light.'],[4,'God saw the light, and saw that it was good. God divided the light from the darkness.'],[5,'God called the light “day”, and the darkness he called “night”. There was evening and there was morning, the first day.']].forEach(v=>verse.run('GEN',1,...v));
  [[16,'For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.'],[17,'For God didn’t send his Son into the world to judge the world, but that the world should be saved through him.']].forEach(v=>verse.run('JHN',3,...v));
  const q=db.prepare('INSERT INTO questions VALUES(?,?,?,?,?,?,?,?,?,?,?)');
  q.run('GEN-000001','GEN',1,1,1,'What did God create in the beginning?','The heavens and the earth','Only the sea','The sun and moon','Humankind',0);
  q.run('GEN-000002','GEN',1,3,3,'What happened when God said, “Let there be light”?','The stars appeared','There was light','Night began','The waters divided',1);
  q.run('JHN-000001','JHN',3,16,17,'Why did God send his Son into the world?','To condemn it','To rule Rome','That the world should be saved through him','To establish an earthly kingdom',2);
 }
 // Content seeding is idempotent so an interrupted first launch repairs itself.
 const repairQuestion=db.prepare('INSERT OR IGNORE INTO questions VALUES(?,?,?,?,?,?,?,?,?,?,?)');
 repairQuestion.run('GEN-000001','GEN',1,1,1,'What did God create in the beginning?','The heavens and the earth','Only the sea','The sun and moon','Humankind',0);
 repairQuestion.run('GEN-000002','GEN',1,3,3,'What happened when God said, “Let there be light”?','The stars appeared','There was light','Night began','The waters divided',1);
 repairQuestion.run('JHN-000001','JHN',3,16,17,'Why did God send his Son into the world?','To condemn it','To rule Rome','That the world should be saved through him','To establish an earthly kingdom',2);
 // Replacing by ID updates existing installations as the curated bank evolves.
 const curatedQuestion=db.prepare('INSERT OR REPLACE INTO questions VALUES(?,?,?,?,?,?,?,?,?,?,?)');
 const syncQuestions=db.transaction(()=>QUESTIONS.forEach(question=>curatedQuestion.run(...question)));
 syncQuestions();
 db.prepare('INSERT OR REPLACE INTO metadata(key,value) VALUES(?,?)').run('question_bank_version','1.1-genesis');
 if(webVerseFile&&fs.existsSync(webVerseFile)){
  const count=(db.prepare('SELECT COUNT(*) count FROM verses').get() as {count:number}).count;
  if(count<30000){
   const insert=db.prepare('INSERT OR REPLACE INTO verses(book_id,chapter,verse,text) VALUES(?,?,?,?)');
   const importWeb=db.transaction(()=>{
    for(const line of fs.readFileSync(webVerseFile,'utf8').split(/\r?\n/)){
     if(!line)continue;
     const match=/^(\S+) (\d+):(\d+) (.*)$/.exec(line);
     if(!match)throw new Error(`Invalid WEB verse line: ${line.slice(0,80)}`);
     insert.run(WEB_BOOK_IDS[match[1]]??match[1],Number(match[2]),Number(match[3]),match[4]);
    }
    db.prepare('INSERT OR REPLACE INTO metadata(key,value) VALUES(?,?)').run('bible_version','WEBP-2026');
   });
   importWeb();
  }
 }
 return db;
}

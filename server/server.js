import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const {Pool}=pg;
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const app=express();app.use(cors());app.use(express.json());
const q=(text,params=[])=>pool.query(text,params);

const careers=[
 ["Full Stack Developer",["HTML","CSS","JavaScript","React","Node.js","SQL","Git","REST APIs"],["HTML & CSS","JavaScript","Git & GitHub","React","Node.js & REST APIs","SQL & Databases","Build 3 Full-Stack Projects"]],
 ["AI/ML Engineer",["Python","NumPy","Pandas","Statistics","Machine Learning","Deep Learning","SQL","Git"],["Python","NumPy & Pandas","Statistics","SQL & Data Handling","Machine Learning","Deep Learning","Build 3 ML Projects"]],
 ["Cybersecurity Engineer",["Python","Linux","Networking","Git","Cryptography","Web Security","Ethical Hacking","Security Tools"],["Linux Fundamentals","Networking","Python for Security","Cryptography","Web Security","Ethical Hacking","Build Security Projects"]],
 ["Cloud Engineer",["Linux","Networking","Git","Python","Docker","AWS","Kubernetes","CI/CD"],["Linux","Networking","Git","Docker","AWS","CI/CD","Kubernetes"]],
 ["Android Developer",["Java","Kotlin","Android Studio","Git","SQL","REST APIs","Firebase","UI/UX"],["Kotlin / Java","Android Studio","UI Development","REST APIs","Firebase","Git & GitHub","Publish an Android App"]],
 ["Data Scientist",["Python","NumPy","Pandas","Statistics","SQL","Data Visualization","Machine Learning","Git"],["Python","NumPy & Pandas","Statistics","SQL","Data Visualization","Machine Learning","Build Data Projects"]]
];

async function init(){
 await q(`CREATE TABLE IF NOT EXISTS careers(id SERIAL PRIMARY KEY,name TEXT UNIQUE NOT NULL,skills JSONB NOT NULL,roadmap JSONB NOT NULL)`);
 await q(`CREATE TABLE IF NOT EXISTS students(id SERIAL PRIMARY KEY,name TEXT,college TEXT,branch TEXT,semester TEXT,cgpa TEXT,career_goal_id INT REFERENCES careers(id),github_score INT DEFAULT 0)`);
 await q(`CREATE TABLE IF NOT EXISTS skills(id SERIAL PRIMARY KEY,student_id INT REFERENCES students(id) ON DELETE CASCADE,name TEXT NOT NULL)`);
 await q(`CREATE TABLE IF NOT EXISTS projects(id SERIAL PRIMARY KEY,student_id INT REFERENCES students(id) ON DELETE CASCADE,name TEXT,description TEXT,technologies TEXT)`);
 await q(`CREATE TABLE IF NOT EXISTS certifications(id SERIAL PRIMARY KEY,student_id INT REFERENCES students(id) ON DELETE CASCADE,name TEXT,issuer TEXT,year TEXT)`);
 await q(`CREATE TABLE IF NOT EXISTS internships(id SERIAL PRIMARY KEY,student_id INT REFERENCES students(id) ON DELETE CASCADE,company TEXT,role TEXT,status TEXT)`);
 for(const [name,skills,roadmap] of careers) await q(`INSERT INTO careers(name,skills,roadmap) VALUES($1,$2,$3) ON CONFLICT(name) DO NOTHING`,[name,JSON.stringify(skills),JSON.stringify(roadmap)]);
 const s=await q("SELECT id FROM students WHERE id=1");
 if(!s.rows.length){
   const c=(await q("SELECT id FROM careers WHERE name='Full Stack Developer'")).rows[0].id;
   await q("INSERT INTO students(id,name,college,branch,semester,cgpa,career_goal_id,github_score) VALUES(1,'Dhyey Patel','GSFC University','CSE','1','8.2',$1,70)",[c]);
   for(const x of ["HTML","CSS","JavaScript","Python","Git"]) await q("INSERT INTO skills(student_id,name) VALUES(1,$1)",[x]);
   await q("INSERT INTO projects(student_id,name,description,technologies) VALUES(1,'Portfolio Website','Responsive personal portfolio website.','HTML • CSS • JavaScript'),(1,'Calculator','A simple calculator built for learning JavaScript.','HTML • CSS • JavaScript')");
   await q("INSERT INTO certifications(student_id,name,issuer,year) VALUES(1,'Python Fundamentals','Online Certification','2026')");
 }
}

function calc(student,career,skills,projects,certs,internships){
 const have=skills.map(x=>x.name.toLowerCase()), matched=career.skills.filter(x=>have.includes(x.toLowerCase())), missing=career.skills.filter(x=>!have.includes(x.toLowerCase()));
 const skillPct=matched.length/career.skills.length*100, projectPct=Math.min(projects.length/3,1)*100, certPct=Math.min(certs.length/2,1)*100, internPct=internships.some(x=>x.company)?100:0;
 const readiness=Math.round(skillPct*.45+projectPct*.25+certPct*.1+internPct*.1+(student.github_score||0)*.1);
 const next=[]; if(missing[0])next.push({title:`Learn ${missing[0]}`,description:`Start with ${missing[0]} because it is a core requirement for your target career.`,priority:"HIGH"});
 if(projects.length<3)next.push({title:"Build one portfolio project",description:`Build a project using ${missing[0]||"your strongest skill"} and publish it on GitHub.`,priority:"MEDIUM"});
 if((student.github_score||0)<90)next.push({title:"Strengthen your GitHub",description:"Push projects regularly and write useful README files.",priority:"MEDIUM"});
 return {readiness,matchedSkills:matched,missingSkills:missing,nextActions:next.slice(0,3)};
}
async function getProfile(){
 const student=(await q("SELECT * FROM students WHERE id=1")).rows[0];
 const career=(await q("SELECT * FROM careers WHERE id=$1",[student.career_goal_id])).rows[0];
 const [skills,projects,certs,internships]=await Promise.all([
  q("SELECT * FROM skills WHERE student_id=1 ORDER BY id"),
  q("SELECT * FROM projects WHERE student_id=1 ORDER BY id"),
  q("SELECT * FROM certifications WHERE student_id=1 ORDER BY id"),
  q("SELECT * FROM internships WHERE student_id=1 ORDER BY id")
 ]);
 const analysis=calc(student,career,skills.rows,projects.rows,certs.rows,internships.rows);
 return {...student,skills:skills.rows,projects:projects.rows,certifications:certs.rows,internships:internships.rows,analysis,careerSkills:career.skills.map(name=>({name,matched:analysis.matchedSkills.includes(name)}))};
}
app.get("/api/health",(req,res)=>res.json({ok:true}));
app.get("/api/profile/:id",async(req,res)=>{try{res.json(await getProfile())}catch(e){res.status(500).json({error:e.message})}});
app.get("/api/careers",async(req,res)=>{try{
 const profile=await getProfile(), all=(await q("SELECT * FROM careers ORDER BY id")).rows;
 const result=all.map(c=>{const a=calc(profile,c,profile.skills,profile.projects,profile.certifications,profile.internships);return {...c,readiness:a.readiness,missing:a.missingSkills.length,topGap:a.missingSkills[0]||null}});
 res.json(result);
}catch(e){res.status(500).json({error:e.message})}});
app.put("/api/profile/:id",async(req,res)=>{try{const {name,college,branch,semester,cgpa,career_goal_id,github_score}=req.body;await q("UPDATE students SET name=$1,college=$2,branch=$3,semester=$4,cgpa=$5,career_goal_id=$6,github_score=$7 WHERE id=1",[name,college,branch,semester,cgpa,career_goal_id,github_score]);res.json(await getProfile())}catch(e){res.status(500).json({error:e.message})}});
app.put("/api/profile/:id/goal",async(req,res)=>{await q("UPDATE students SET career_goal_id=$1 WHERE id=1",[req.body.careerId]);res.json(await getProfile())});
app.post("/api/profile/:id/skills",async(req,res)=>{await q("INSERT INTO skills(student_id,name) VALUES(1,$1)",[req.body.name]);res.json(await getProfile())});
app.delete("/api/profile/:id/skills/:skillId",async(req,res)=>{await q("DELETE FROM skills WHERE id=$1 AND student_id=1",[req.params.skillId]);res.json(await getProfile())});
app.post("/api/profile/:id/projects",async(req,res)=>{await q("INSERT INTO projects(student_id,name,description,technologies) VALUES(1,$1,$2,$3)",[req.body.name,req.body.description,req.body.technologies]);res.json(await getProfile())});
app.post("/api/demo/reset",async(req,res)=>{await q("DELETE FROM skills WHERE student_id=1");await q("DELETE FROM projects WHERE student_id=1");await q("DELETE FROM certifications WHERE student_id=1");await q("DELETE FROM internships WHERE student_id=1");const c=(await q("SELECT id FROM careers WHERE name='Full Stack Developer'")).rows[0].id;await q("UPDATE students SET name='Dhyey Patel',college='GSFC University',branch='CSE',semester='1',cgpa='8.2',career_goal_id=$1,github_score=70 WHERE id=1",[c]);for(const x of ["HTML","CSS","JavaScript","Python","Git"])await q("INSERT INTO skills(student_id,name) VALUES(1,$1)",[x]);await q("INSERT INTO projects(student_id,name,description,technologies) VALUES(1,'Portfolio Website','Responsive personal portfolio website.','HTML • CSS • JavaScript'),(1,'Calculator','A simple calculator built for learning JavaScript.','HTML • CSS • JavaScript')");await q("INSERT INTO certifications(student_id,name,issuer,year) VALUES(1,'Python Fundamentals','Online Certification','2026')");res.json(await getProfile())});

const PORT=process.env.PORT||5000;
init().then(()=>app.listen(PORT,()=>console.log(`CareerGap API running on http://localhost:${PORT}`))).catch(e=>{console.error(e);process.exit(1)});

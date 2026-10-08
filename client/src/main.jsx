import React,{useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import {LayoutDashboard,UserRound,BrainCircuit,Map,Compass,Plus,Trash2,CheckCircle2,LockKeyhole,ArrowRight,Target,BriefcaseBusiness,Award,Code2,RefreshCw,Save,ChevronRight} from "lucide-react";
import "./styles.css";

const API="http://localhost:5000/api";
const careerIcons={"Full Stack Developer":"💻","AI/ML Engineer":"🤖","Cybersecurity Engineer":"🔐","Cloud Engineer":"☁️","Android Developer":"📱","Data Scientist":"📊"};

function App(){
 const [profile,setProfile]=useState(null),[careers,setCareers]=useState([]),[page,setPage]=useState("dashboard"),[loading,setLoading]=useState(true),[toast,setToast]=useState("");
 const load=async()=>{setLoading(true);const [p,c]=await Promise.all([fetch(API+"/profile/1").then(r=>r.json()),fetch(API+"/careers").then(r=>r.json())]);setProfile(p);setCareers(c);setLoading(false)};
 useEffect(()=>{load()},[]);
 const notify=m=>{setToast(m);setTimeout(()=>setToast(""),2200)};
 if(loading)return <div className="loading"><div className="loader"></div>Loading CareerGap...</div>;
 const analysis=profile.analysis||{readiness:0,missingSkills:[],matchedSkills:[],nextActions:[]};
 const career=careers.find(c=>c.id===profile.career_goal_id)||careers[0];
 const nav=[["dashboard","Dashboard",LayoutDashboard],["profile","My Profile",UserRound],["skills","Skills & Projects",BrainCircuit],["roadmap","Career Roadmap",Map],["explore","Career Simulator",Compass]];
 return <div className="app">
  <aside><div className="brand"><div className="logo">CG</div><div><b>CareerGap</b><small>Smart Career Profile</small></div></div>
   <nav>{nav.map(([id,label,I])=><button className={page===id?"active":""} onClick={()=>setPage(id)}><I size={17}/>{label}</button>)}</nav>
   <div className="sideBottom"><div className="goalMini"><Target size={17}/><div><b>{career?.name}</b><small>Current goal</small></div></div><button className="reset" onClick={async()=>{await fetch(API+"/demo/reset",{method:"POST"});await load();notify("Demo data reset ✓")}}><RefreshCw size={13}/> Reset demo</button></div>
  </aside>
  <main><header><div><span className="eyebrow">STUDENT CAREER COMMAND CENTER</span><h1>{page==="dashboard"?`Good morning, ${profile.name.split(" ")[0]} 👋`:nav.find(x=>x[0]===page)?.[1]}</h1></div><button className="avatar" onClick={()=>setPage("profile")}>{profile.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</button></header>
   {page==="dashboard"&&<Dashboard p={profile} a={analysis} career={career} go={setPage}/>}
   {page==="profile"&&<Profile p={profile} careers={careers} refresh={load} notify={notify}/>}
   {page==="skills"&&<Skills p={profile} refresh={load} notify={notify}/>}
   {page==="roadmap"&&<Roadmap p={profile} a={analysis} career={career} go={setPage}/>}
   {page==="explore"&&<Explore p={profile} careers={careers} refresh={load} notify={notify}/>}
  </main>
  {toast&&<div className="toast">{toast}</div>}
 </div>
}

function Ring({score}){return <div className="ring" style={{"--score":score}}><div><strong>{score}%</strong><small>READY</small></div></div>}
function Dashboard({p,a,career,go}){
 return <><section className="hero"><div><span className="pill dark">{careerIcons[career.name]} {career.name}</span><h2>Your career, mapped to reality.</h2><p>CareerGap compares your current profile with the skills your target career demands, identifies gaps and converts them into an actionable roadmap.</p><button onClick={()=>go("roadmap")} className="btn">View my roadmap <ArrowRight size={15}/></button></div><Ring score={a.readiness}/></section>
 <div className="stats"><Stat icon={<Target/>} label="Career readiness" value={a.readiness+"%"}/><Stat icon={<Code2/>} label="Skills matched" value={a.matchedSkills.length+"/"+career.skills.length}/><Stat icon={<BriefcaseBusiness/>} label="Projects" value={p.projects.length}/><Stat icon={<Award/>} label="Certificates" value={p.certifications.length}/></div>
 <Section title="⚠️ Your skill gaps" sub={`What you should focus on for ${career.name}`} action={<button className="btn light" onClick={()=>go("explore")}>Compare careers</button>}/>
 <div className="cards3">{a.missingSkills.slice(0,6).map((s,i)=><div className="card gap"><span className={"pill "+(i<2?"red":"orange")}>{i<2?"HIGH":"MEDIUM"} PRIORITY</span><h3>{s}</h3><p>Required for {career.name} but not yet in your profile.</p></div>)}{!a.missingSkills.length&&<div className="card empty">🎉 No major skill gaps! Keep building.</div>}</div>
 <Section title="📌 Your next 3 moves" sub="Small actions that move your score forward."/>
 <div className="cards3">{a.nextActions.map((x,i)=><div className="card action"><div className="numCircle">{i+1}</div><div><h3>{x.title}</h3><p>{x.description}</p><span className="pill orange">{x.priority} PRIORITY</span></div></div>)}</div></>
}
function Stat({icon,label,value}){return <div className="card stat"><div><small>{label}</small><strong>{value}</strong></div><span className="statIcon">{icon}</span></div>}
function Section({title,sub,action}){return <div className="sectionHead"><div><h2>{title}</h2>{sub&&<p>{sub}</p>}</div>{action}</div>}

function Profile({p,careers,refresh,notify}){
 const [form,setForm]=useState({...p});const set=(k,v)=>setForm({...form,[k]:v});
 async function save(e){e.preventDefault();await fetch(API+"/profile/1",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});await refresh();notify("Profile updated ✓")}
 return <><div className="card profileHead"><div className="bigAvatar">{p.name.split(" ").map(x=>x[0]).join("").slice(0,2)}</div><div><h2>{p.name}</h2><p>{p.branch} • Semester {p.semester} • {p.college}</p><span className="pill">{careerIcons[careers.find(c=>c.id===p.career_goal_id)?.name]} {careers.find(c=>c.id===p.career_goal_id)?.name}</span></div></div>
 <Section title="Edit profile" sub="Your digital career identity."/>
 <form className="card form" onSubmit={save}>{[["name","Full Name"],["college","College"],["branch","Branch"],["semester","Semester"],["cgpa","CGPA"]].map(([k,l])=><label>{l}<input value={form[k]??""} onChange={e=>set(k,e.target.value)}/></label>)}<label>Target Career<select value={form.career_goal_id} onChange={e=>set("career_goal_id",Number(e.target.value))}>{careers.map(c=><option value={c.id}>{c.name}</option>)}</select></label><label className="full">GitHub strength (0–100)<input type="number" value={form.github_score??0} onChange={e=>set("github_score",Number(e.target.value))}/></label><button className="btn"><Save size={15}/> Save profile</button></form></>
}

function Skills({p,refresh,notify}){
 const [skill,setSkill]=useState("");const [show,setShow]=useState(false);
 async function addSkill(e){e.preventDefault();if(!skill.trim())return;await fetch(API+"/profile/1/skills",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:skill})});setSkill("");setShow(false);await refresh();notify("Skill added ✓")}
 async function del(id){await fetch(API+"/profile/1/skills/"+id,{method:"DELETE"});await refresh();notify("Skill removed")}
 const [project,setProject]=useState({name:"",description:"",technologies:""});const [ps,setPs]=useState(false);
 async function addProject(e){e.preventDefault();await fetch(API+"/profile/1/projects",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(project)});setProject({name:"",description:"",technologies:""});setPs(false);await refresh();notify("Project added ✓")}
 return <><Section title="Skills & Projects" sub="Evidence that you can apply what you learn." action={<button className="btn" onClick={()=>setShow(!show)}><Plus size={15}/> Add Skill</button>}/>
 {show&&<form className="inlineForm card" onSubmit={addSkill}><input autoFocus value={skill} onChange={e=>setSkill(e.target.value)} placeholder="e.g. React"/><button className="btn">Add</button></form>}
 <div className="grid2"><div className="card"><h3>Your skills</h3><p>Skills currently on your profile.</p><div className="tags">{p.skills.map(s=><span className="pill green">{s.name}<button onClick={()=>del(s.id)}>×</button></span>)}</div></div><div className="card"><h3>Career skill match</h3><p>Matched skills are calculated against your target career.</p>{p.careerSkills.map(s=><div className="skillbar"><div><span>{s.name}</span><b>{s.matched?"100%":"0%"}</b></div><div className="bar"><i style={{width:s.matched?"100%":"0%"}}/></div></div>)}</div></div>
 <Section title="🚀 Projects" sub="Your project portfolio." action={<button className="btn light" onClick={()=>setPs(!ps)}><Plus size={15}/> Add Project</button>}/>
 {ps&&<form className="card form" onSubmit={addProject}><label>Project name<input required value={project.name} onChange={e=>setProject({...project,name:e.target.value})}/></label><label>Technologies<input value={project.technologies} onChange={e=>setProject({...project,technologies:e.target.value})}/></label><label className="full">Description<textarea required value={project.description} onChange={e=>setProject({...project,description:e.target.value})}/></label><button className="btn">Add project</button></form>}
 <div className="cards2">{p.projects.map(x=><div className="card project"><div className="projectIcon">🚀</div><div><h3>{x.name}</h3><p>{x.description}</p><span className="pill">{x.technologies||"Project"}</span></div></div>)}</div>
 <Section title="🏆 Certifications & 💼 Internships" sub="Your career evidence."/>
 <div className="card"><table><thead><tr><th>Type</th><th>Name / Company</th><th>Details</th><th>Status</th></tr></thead><tbody>{p.certifications.map(c=><tr><td>🏆 Certificate</td><td><b>{c.name}</b></td><td>{c.issuer} • {c.year}</td><td><span className="pill green">Verified</span></td></tr>)}{p.internships.filter(x=>x.company).map(i=><tr><td>💼 Internship</td><td><b>{i.company}</b></td><td>{i.role}</td><td><span className="pill orange">{i.status}</span></td></tr>)}</tbody></table></div></>
}

function Roadmap({a,career,go}){
 return <><section className="hero"><div><span className="pill dark">{careerIcons[career.name]} {career.name}</span><h2>Your personalized roadmap.</h2><p>Follow these milestones to close your biggest career gaps.</p></div><Ring score={a.readiness}/></section>
 <div className="grid2"><div className="card"><h3>🗺️ Roadmap milestones</h3><p>Build foundations first, then unlock advanced milestones.</p><div className="roadmap">{career.roadmap.map((s,i)=>{const done=i===0&&a.matchedSkills.some(x=>x.toLowerCase()===s.toLowerCase());return <div className="step"><div className={"dot "+(done?"done":"")}>{done?<CheckCircle2 size={17}/>:i+1}</div><div><h3>{s} {done&&<span className="pill green">COMPLETED</span>}</h3><p>{done?"You already have this skill in your profile.":i<2?"Core foundation for your career.":"Complete previous foundations to unlock this milestone."}</p></div></div>})}</div></div>
 <div className="card"><h3>🎯 What you're missing</h3><p>Prioritized gaps for {career.name}.</p>{a.missingSkills.map((s,i)=><div className="skillbar"><div><span><b>{i<2?"High":"Medium"}</b> · {s}</span><b>0%</b></div><div className="bar"><i/></div></div>)}{!a.missingSkills.length&&<div className="empty">🎉 All core skills matched!</div>}<button className="btn" onClick={()=>go("skills")}>Update my skills <ArrowRight size={15}/></button></div></div></>
}

function Explore({p,careers,refresh,notify}){
 async function choose(id){await fetch(API+"/profile/1/goal",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({careerId:id})});await refresh();notify("Career goal changed ✓")}
 return <><Section title="🔄 Career Simulator" sub="Change the destination and see how your current profile matches."/><div className="cards3">{careers.map(c=><div className={"card career "+(c.id===p.career_goal_id?"selected":"")}><div className="careerIcon">{careerIcons[c.name]}</div><h3>{c.name}</h3><b className="match">{c.readiness}% match</b><div className="bar"><i style={{width:c.readiness+"%"}}/></div><p>{c.missing} skill gaps • {p.projects.length} projects</p><button className="btn light" disabled={c.id===p.career_goal_id} onClick={()=>choose(c.id)}>{c.id===p.career_goal_id?"Current goal":"Set as my goal"}</button></div>)}</div>
 <Section title="📊 Career comparison" sub="Same student profile, different career destinations."/><div className="card"><table><thead><tr><th>Career</th><th>Readiness</th><th>Missing</th><th>Top gap</th></tr></thead><tbody>{careers.map(c=><tr><td><b>{careerIcons[c.name]} {c.name}</b></td><td><b>{c.readiness}%</b></td><td>{c.missing}</td><td>{c.topGap||"None 🎉"}</td></tr>)}</tbody></table></div></>
}
function App2(){return <App/>}
createRoot(document.getElementById("root")).render(<App2/>);

import { useEffect, useState } from "react";
import { Check, Copy, Gamepad2, LockKeyhole, ShieldCheck, UserPlus, Users, Wifi } from "lucide-react";
import type { Book, Profile } from "../shared/types";
import {
  hasUploadedProfile, isUsernameAvailable, listFriendConnections, onlineErrorMessage,
  removeFriendConnection, respondFriendRequest, restoreOnlineAccount, sendFriendRequest, subscribeToOnlineUsers,
  sendPasswordRecovery, signInOnline, signOutOnline, signUpOnline, syncReaderData, syncXpLedger,
  uploadInitialProfile, type AgeGroup, type FriendConnection, type OnlineAccount,
} from "./onlineService";
import "./online.css";
import CustomGame from "./CustomGame";

type Section="overview"|"account"|"friends"|"games";
type SyncState="offline"|"attention"|"syncing"|"synced";

export default function OnlineLive({profile,books}: {profile:Profile;books:Book[]}) {
  const [section,setSection]=useState<Section>("overview");
  const [account,setAccount]=useState<OnlineAccount|null>(null);
  const [sync,setSync]=useState<SyncState>("offline");
  useEffect(()=>{void restoreOnlineAccount().then(async restored=>{
    setAccount(restored);
    setSync(restored&&await hasUploadedProfile(restored.onlineUserId)?"synced":restored?"attention":"offline");
  }).catch(()=>setSync("attention"));},[]);
  useEffect(()=>{if(account)void window.selah.invoke("profile:link-online",account.onlineUserId)},[account,profile.id]);
  return <section className="page online-page">
    <div className="online-title"><div><span className="eyebrow">BIBLE TRIVIA ONLINE</span><h1>Learn alongside friends</h1><p>Account sync and friend connections are live. Bible study and practice remain available offline.</p></div><span className="preview-pill"><span/>{account?"Online account connected":"Offline mode"}</span></div>
    <nav className="online-nav">
      <button className={section==="overview"?"active":""} onClick={()=>setSection("overview")}><Users size={16}/>Overview</button>
      <button className={section==="account"?"active":""} onClick={()=>setSection("account")}><LockKeyhole size={16}/>Account</button>
      {account&&<button className={section==="friends"?"active":""} onClick={()=>setSection("friends")}><UserPlus size={16}/>Friends</button>}
      {account&&<button className={section==="games"?"active":""} onClick={()=>setSection("games")}><Gamepad2 size={16}/>Games</button>}
    </nav>
    {section==="overview"&&<Overview profile={profile} account={account} sync={sync} go={setSection}/>} 
    {section==="account"&&<Account profile={profile} account={account} setAccount={setAccount} sync={sync} setSync={setSync}/>} 
    {section==="friends"&&account&&<Friends userId={account.onlineUserId}/>}
    {section==="games"&&account&&<CustomGame books={books}/>}
  </section>;
}

function Overview({profile,account,sync,go}:{profile:Profile;account:OnlineAccount|null;sync:SyncState;go:(s:Section)=>void}){
  return <div className="online-hero card"><div><span className="online-icon large"><Users/></span><span className="eyebrow">WELCOME, {(account?.username??profile.name).toUpperCase()}</span><h2>{account?"Your online profile is connected":"Connect your existing local profile"}</h2><p>{account?"Synchronize your points or connect with a friend using a private code.":"Your local profile remains on this computer until you choose to link and upload it."}</p><button className="primary" onClick={()=>go(account?"friends":"account")}>{account?"View friends":"Connect account"}</button></div><div className="overview-status"><div><Wifi/><span>Sync status</span><b>{sync}</b></div></div></div>;
}

function Account({profile,account,setAccount,sync,setSync}:{profile:Profile;account:OnlineAccount|null;setAccount:(a:OnlineAccount|null)=>void;sync:SyncState;setSync:(s:SyncState)=>void}){
  const [mode,setMode]=useState<"register"|"signin"|"recover">("signin");
  const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[username,setUsername]=useState(profile.name.replace(/\W/g,"")||"BibleReader"),[age,setAge]=useState<AgeGroup>("18plus"),[message,setMessage]=useState(""),[available,setAvailable]=useState<boolean|null>(null);
  const fail=(e:unknown,fallback:string)=>setMessage(onlineErrorMessage(e,fallback));
  if(account){
    const runSync=async()=>{setSync("syncing");setMessage("");try{if(!(await hasUploadedProfile(account.onlineUserId)))await uploadInitialProfile(account.onlineUserId);await syncXpLedger(account.onlineUserId);await syncReaderData(account.onlineUserId);setSync("synced");setMessage("Points and Bible Reader data were safely updated online.");}catch(e){setSync("attention");fail(e,"Synchronization failed.")}};
    return <div className="account-layout"><section className="card account-profile"><div className="admin-avatar">🐑</div><h2>{account.username}{account.admin&&<span className="admin-tag">ADMIN</span>}</h2><p>{account.email} · Verified</p>{account.admin&&<div className="admin-success"><ShieldCheck size={17}/>Administrator account confirmed by Supabase</div>}<div className="code-box"><span>{account.friendCode}</span><button onClick={()=>void navigator.clipboard?.writeText(account.friendCode)}><Copy size={17}/></button></div><button className="secondary" onClick={()=>void signOutOnline().then(()=>{setAccount(null);setSync("offline")})}>Sign out</button></section><section className="card settings-list"><span className="eyebrow">ACCOUNT & SYNC</span><h2>Local profile connection</h2><div className="sync-banner"><Wifi/><div><b>{sync==="syncing"?"Synchronizing…":sync==="synced"?"Points are synchronized":"Progress needs attention"}</b><small>XP events are added once, even after offline play</small></div><button className="secondary" disabled={sync==="syncing"} onClick={()=>void runSync()}>Sync now</button></div>{message&&<p className={sync==="synced"?"admin-success":"form-error"}>{message}</p>}<div className="setting"><b>This local profile</b><small>{profile.name} · Current device</small></div></section></div>;
  }
  const signIn=async()=>{setMessage("");try{const value=await signInOnline(email,password);setAccount(value);setSync(await hasUploadedProfile(value.onlineUserId)?"synced":"attention")}catch(e){fail(e,"Sign-in failed.")}};
  const register=async()=>{if(age==="under13"){setMessage("Under-13 registration is unavailable until parental approval is implemented.");return}if(!email.includes("@")||username.length<3||password.length<12){setMessage("Enter a valid email and username, and use at least 12 password characters.");return}try{const value=await signUpOnline({email,password,username,ageGroup:age});if(value){setAccount(value);setSync("attention")}else{setMode("signin");setMessage("Verification email sent. Verify it, then sign in.")}}catch(e){fail(e,"Account creation failed.")}};
  return <section className="registration card auth-compact"><span className="eyebrow">{mode==="register"?"CREATE ONLINE ACCOUNT":mode==="recover"?"ACCOUNT RECOVERY":"WELCOME BACK"}</span><h2>{mode==="register"?"Connect this local profile":mode==="recover"?"Reset your password":"Sign in to your online account"}</h2>{mode==="register"&&<><label>Age category<select value={age} onChange={e=>setAge(e.target.value as AgeGroup)}><option value="18plus">18 or older</option><option value="13to17">13–17</option><option value="under13">Under 13</option></select></label><label>Unique public username<div className="username-check"><input value={username} onChange={e=>{setUsername(e.target.value);setAvailable(null)}}/><button className="secondary" onClick={()=>void isUsernameAvailable(username).then(setAvailable).catch(e=>fail(e,"Check failed."))}>Check</button></div>{available!==null&&<small className={available?"available":"unavailable"}>{available?"Username is available":"Try another username"}</small>}</label></>}<label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label>{mode!=="recover"&&<label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label>}{message&&<p className="form-error">{message}</p>}{mode==="signin"&&<button className="primary" onClick={()=>void signIn()}>Sign in</button>}{mode==="register"&&<button className="primary" onClick={()=>void register()}>Create account</button>}{mode==="recover"&&<button className="primary" onClick={()=>void sendPasswordRecovery(email).then(()=>setMessage("Recovery email sent.")).catch(e=>fail(e,"Recovery failed."))}>Send recovery email</button>}<button className="link-button" onClick={()=>setMode(mode==="signin"?"register":"signin")}>{mode==="signin"?"Create a new account":"Back to sign in"}</button>{mode==="signin"&&<button className="link-button" onClick={()=>setMode("recover")}>Forgot password?</button>}</section>;
}

function Friends({userId}:{userId:string}){
  const [items,setItems]=useState<FriendConnection[]>([]),[code,setCode]=useState(""),[message,setMessage]=useState(""),[loading,setLoading]=useState(true);
  const [onlineUserIds,setOnlineUserIds]=useState<Set<string>>(()=>new Set());
  const load=()=>listFriendConnections().then(setItems).catch(e=>setMessage(onlineErrorMessage(e,"Could not load friends."))).finally(()=>setLoading(false));
  useEffect(()=>{void load()},[]);
  useEffect(()=>subscribeToOnlineUsers(userId,setOnlineUserIds),[userId]);
  const act=async(action:()=>Promise<void>,success:string)=>{setMessage("");try{await action();setMessage(success);await load()}catch(e){setMessage(onlineErrorMessage(e,"Friend action failed."))}};
  const friends=items.filter(i=>i.direction==="friend"),incoming=items.filter(i=>i.direction==="incoming"),outgoing=items.filter(i=>i.direction==="outgoing");
  return <>
    <section className="friend-add card">
      <div><span className="eyebrow">PRIVATE FRIEND CODES</span><h2>Add someone you know</h2><p>Enter the code shown on your friend’s Account page. They must accept before you connect.</p></div>
      <div className="friend-search"><UserPlus/><input value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="Friend code"/><button className="primary" disabled={!code.trim()} onClick={()=>void act(()=>sendFriendRequest(code),"Friend request sent.").then(()=>setCode(""))}>Send request</button></div>
      {message&&<p>{message}</p>}
    </section>
    <section className="friends-directory card">
      <h2>Connections</h2>
      {loading?<p>Loading…</p>:items.length===0?<div className="online-empty"><Users/><h3>No connections yet</h3><p>Share your private friend code with someone you know.</p></div>:<div className="friend-list">
        {incoming.map(i=><div key={i.id}><span>👤</span><div><b>{i.username}</b><small>Incoming request</small></div><button className="primary" onClick={()=>void act(()=>respondFriendRequest(i.id,true),"Friend request accepted.")}><Check size={15}/>Accept</button><button className="secondary" onClick={()=>void act(()=>respondFriendRequest(i.id,false),"Request declined.")}>Decline</button></div>)}
        {outgoing.map(i=><div key={i.id}><span>👤</span><div><b>{i.username}</b><small>Request pending</small></div><button className="secondary" onClick={()=>void act(()=>removeFriendConnection(i.id),"Request cancelled.")}>Cancel</button></div>)}
        {friends.map(i=><div key={i.id}><span>👤<i className={onlineUserIds.has(i.userId)?"online":""} title={onlineUserIds.has(i.userId)?"Online":"Offline"}/></span><div><b>{i.username}</b><small>{onlineUserIds.has(i.userId)?"Online":"Friend"}</small></div><button className="danger" onClick={()=>void act(()=>removeFriendConnection(i.id),"Friend removed.")}>Remove</button></div>)}
      </div>}
    </section>
  </>;
}

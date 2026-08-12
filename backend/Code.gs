/* ══════════════════════════════════════════════════════
   騎樓沒有路 NO WAY THROUGH — 排行榜後端（GAS Web App）
   零授權範圍設計：只用 PropertiesService / LockService / ContentService
   API：
     GET                              → {ok, top:[{n,s,c,t}...]}（前 50 名）
     POST body=JSON {name,score,car}  → {ok, rank, best, top}
   規則：同名玩家只保留最佳成績；最多保存 200 筆；分數上限 5999 秒
   ══════════════════════════════════════════════════════ */
const KEY = 'lb_v1';
const MAX_KEEP = 200;
const TOP_N = 50;

function _load(){
  const raw = PropertiesService.getScriptProperties().getProperty(KEY);
  return raw ? JSON.parse(raw) : [];
}
function _save(list){
  PropertiesService.getScriptProperties().setProperty(KEY, JSON.stringify(list));
}
function _json(obj){
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e){
  return _json({ok:true, top: _load().slice(0, TOP_N)});
}

function doPost(e){
  const lock = LockService.getScriptLock();
  try{ lock.waitLock(5000); }catch(err){ return _json({ok:false, err:'busy'}); }
  try{
    let d = {};
    try{ d = JSON.parse(e.postData.contents); }catch(err){ return _json({ok:false, err:'bad json'}); }
    const name = String(d.name || '').replace(/[<>"'`\\]/g, '').trim().slice(0, 12);
    const score = Math.round(Number(d.score) * 10) / 10;
    const car = String(d.car || '').slice(0, 10);
    if(!name || !isFinite(score) || score <= 0 || score > 5999) return _json({ok:false, err:'bad data'});

    let list = _load();
    const i = list.findIndex(r => r.n === name);
    if(i >= 0){
      if(score > list[i].s) list[i] = {n:name, s:score, c:car, t:Date.now()};
    }else{
      list.push({n:name, s:score, c:car, t:Date.now()});
    }
    list.sort((a,b) => b.s - a.s);
    list = list.slice(0, MAX_KEEP);
    _save(list);
    const rank = list.findIndex(r => r.n === name) + 1;
    const mine = list.find(r => r.n === name);
    return _json({ok:true, rank: rank || null, best: mine ? mine.s : score, top: list.slice(0, TOP_N)});
  }finally{
    lock.releaseLock();
  }
}

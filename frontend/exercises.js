// ═══════════════════════════════════════════════════════════════════════════════
// Interactive Bandit Algorithm Exercises — MAB Pirates Integration
// Ported from bandit_algorithm_exercises.html with ex- prefixed classes
// ═══════════════════════════════════════════════════════════════════════════════

const ExD={
etc:{
  id:'etc',nm:'Algorithm I \u2014 ETC',
  code:'import numpy as np\n\nclass BanditAgent:\n    def __init__(self, n_arms):\n        self.n_arms = n_arms\n        self.counts = np.zeros(n_arms)\n        self.values = np.zeros(n_arms)\n        self.m = 15           # exploration pulls per arm\n        self.t = 0            # round counter\n\n    def select_arm(self):\n        self.t += 1\n        if self.t <= self.m * self.n_arms:\n            return (self.t - 1) % self.n_arms\n        return int(np.argmax(self.values))\n\n    def update(self, arm, reward):\n        self.counts[arm] += 1\n        n = self.counts[arm]\n        self.values[arm] += (reward - self.values[arm]) / n',
  bl:{
    tmpl:'    def select_arm(self):\n        self.t += 1\n        if self.t <= self.m * [[B1]]:\n            return ([[B2]] - 1) % self.n_arms\n        return int(np.argmax([[B3]]))\n\n    def update(self, arm, reward):\n        self.counts[arm] += 1\n        n = self.counts[arm]\n        self.values[arm] += (reward - self.values[arm]) / [[B4]]',
    ans:{B1:'self.n_arms',B2:'self.t',B3:'self.values',B4:'n'},
    opts:['self.n_arms','self.t','self.values','n','self.m','self.counts'],
    instr:'Select a token below, then click a blank slot to fill it. Click a filled slot to return it to the pool.'
  },
  ord:{
    instr:'Drag the steps into the correct execution order for select_arm().',
    items:[
      {id:'o1',t:'Return the best arm using argmax \u2014 greedy exploitation'},
      {id:'o2',t:'Increment the round counter: self.t += 1'},
      {id:'o3',t:'Check: is self.t still \u2264 total exploration rounds?'},
      {id:'o4',t:'Return round-robin arm using modulo \u2014 systematic exploration'}
    ],
    correct:['o2','o3','o4','o1']
  },
  mt:{
    instr:'Select a description chip, then click the matching slot next to each code snippet.',
    pairs:[
      {id:'m1',code:'self.t <= self.m * self.n_arms',did:'ed1'},
      {id:'m2',code:'(self.t - 1) % self.n_arms',did:'ed2'},
      {id:'m3',code:'np.argmax(self.values)',did:'ed3'},
      {id:'m4',code:'(reward - self.values[arm]) / n',did:'ed4'}
    ],
    descs:[
      {id:'ed1',t:'End-of-exploration phase boundary check'},
      {id:'ed2',t:'Systematic round-robin arm selection'},
      {id:'ed3',t:'Greedy selection of the best-estimated arm'},
      {id:'ed4',t:'Incremental (online) running mean update'}
    ]
  },
  mcq:[
    {id:'q1',q:'With m=15 and n_arms=8, which phase is the agent in at round t=121?',
     opts:[{id:'A',t:'Still exploring \u2014 15\u00d78=120, and t=121 > 120'},{id:'B',t:'In exploitation \u2014 15\u00d78=120, and t=121 > 120'},{id:'C',t:'Cannot tell without knowing the actual rewards'},{id:'D',t:'Re-exploring \u2014 it detected a suboptimal committed arm'}],cor:'B'},
    {id:'q2',q:'Why does ETC use (self.t \u2212 1) % n_arms instead of a random arm during exploration?',
     opts:[{id:'A',t:'Modulo arithmetic is cheaper than np.random.randint'},{id:'B',t:'It guarantees exactly m pulls for every arm before committing'},{id:'C',t:'It steers away from low-reward arms during exploration'},{id:'D',t:"Hoeffding's inequality assumes sequential sampling order"}],cor:'B'}
  ]
},
eg:{
  id:'eg',nm:'Algorithm II \u2014 \u03b5-Greedy',
  code:'import numpy as np\n\nclass BanditAgent:\n    def __init__(self, n_arms):\n        self.n_arms  = n_arms\n        self.counts  = np.zeros(n_arms)\n        self.values  = np.zeros(n_arms)\n        self.epsilon = 1.0       # start: fully exploratory\n        self.decay   = 0.995     # epsilon shrinks each round\n        self.min_eps = 0.01      # exploration floor\n\n    def select_arm(self):\n        if np.random.random() < self.epsilon:\n            return np.random.randint(self.n_arms)\n        return int(np.argmax(self.values))\n\n    def update(self, arm, reward):\n        self.counts[arm] += 1\n        n = self.counts[arm]\n        self.values[arm] += (reward - self.values[arm]) / n\n        self.epsilon = max(self.min_eps, self.epsilon * self.decay)',
  bl:{
    tmpl:'    def select_arm(self):\n        if np.random.random() < [[B1]]:\n            return np.random.randint([[B2]])\n        return int(np.argmax([[B3]]))\n\n    def update(self, arm, reward):\n        self.counts[arm] += 1\n        n = self.counts[arm]\n        self.values[arm] += (reward - self.values[arm]) / n\n        self.epsilon = max(self.min_eps, self.epsilon * [[B4]])',
    ans:{B1:'self.epsilon',B2:'self.n_arms',B3:'self.values',B4:'self.decay'},
    opts:['self.epsilon','self.n_arms','self.values','self.decay','self.min_eps','n'],
    instr:'Select a token below, then click a blank slot to fill it. Click a filled slot to return it to the pool.'
  },
  ord:{
    instr:'Drag the steps into the correct execution order for update().',
    items:[
      {id:'o1',t:'Read updated pull count into local variable n'},
      {id:'o2',t:'Increment pull counter: self.counts[arm] += 1'},
      {id:'o3',t:"Update the running average for the arm's estimated value"},
      {id:'o4',t:'Decay epsilon: max(min_eps, epsilon \u00d7 decay)'}
    ],
    correct:['o2','o1','o3','o4']
  },
  mt:{
    instr:'Select a description chip, then click the matching slot next to each code snippet.',
    pairs:[
      {id:'m1',code:'np.random.random() < self.epsilon',did:'egd1'},
      {id:'m2',code:'np.random.randint(self.n_arms)',did:'egd2'},
      {id:'m3',code:'np.argmax(self.values)',did:'egd3'},
      {id:'m4',code:'max(self.min_eps, self.epsilon * self.decay)',did:'egd4'}
    ],
    descs:[
      {id:'egd1',t:'Stochastic explore-or-exploit coin flip'},
      {id:'egd2',t:'Uniform random arm selection (exploration action)'},
      {id:'egd3',t:'Greedy best-arm selection (exploitation action)'},
      {id:'egd4',t:'Epsilon decay step with minimum floor'}
    ]
  },
  mcq:[
    {id:'q1',q:'With epsilon=1.0 initially, what does the agent always do before any updates occur?',
     opts:[{id:'A',t:'Always exploits \u2014 argmax of all-zeros returns arm 0'},{id:'B',t:'Always explores \u2014 np.random.random() is always strictly < 1.0'},{id:'C',t:'50/50 split between exploring and exploiting'},{id:'D',t:'Behavior depends on the reward distribution of each arm'}],cor:'B'},
    {id:'q2',q:'Why use max(self.min_eps, ...) instead of letting epsilon decay all the way to 0?',
     opts:[{id:'A',t:'Epsilon = 0 causes a division-by-zero inside update()'},{id:'B',t:'To keep a small exploration rate in case rewards shift over time'},{id:'C',t:"Hoeffding's inequality requires epsilon > 0 throughout training"},{id:'D',t:'np.argmax returns wrong results on tied values when epsilon = 0'}],cor:'B'}
  ]
}};

// ─── State ───────────────────────────────────────────────────────────────────
const ExS={
  etc:{bl:{B1:null,B2:null,B3:null,B4:null},selTok:null,blChk:false,blSc:0,
       ord:null,ordChk:false,ordOk:false,
       mt:{m1:null,m2:null,m3:null,m4:null},selDesc:null,mtChk:false,mtSc:0,
       mcq:{},mcqChk:false,mcqSc:0,refOpen:false},
  eg:{bl:{B1:null,B2:null,B3:null,B4:null},selTok:null,blChk:false,blSc:0,
      ord:null,ordChk:false,ordOk:false,
      mt:{m1:null,m2:null,m3:null,m4:null},selDesc:null,mtChk:false,mtSc:0,
      mcq:{},mcqChk:false,mcqSc:0,refOpen:false}
};

const QUEST_MAP={quest1:'etc',quest2:'eg'};

// ─── Utilities ───────────────────────────────────────────────────────────────
function exShuf(a){const r=[...a];for(let i=r.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[r[i],r[j]]=[r[j],r[i]]}return r}
function exEs(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

function exHl(code){
  let s=exEs(code);
  s=s.replace(/(#[^\n]*)/g,'<span class="ex-sc">$1</span>');
  s=s.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,'<span class="ex-ss">$1</span>');
  s=s.replace(/\b(\d+\.?\d*)\b/g,'<span class="ex-sn">$1</span>');
  s=s.replace(/\b(import|class|def|if|else|elif|return|for|in|while|True|False|None)\b/g,'<span class="ex-sk">$1</span>');
  s=s.replace(/\b(np)\b/g,'<span class="ex-sl">$1</span>');
  s=s.replace(/\b(self)\b/g,'<span class="ex-se">$1</span>');
  s=s.replace(/\b(max|min|int|argmax|zeros|randint|random)\b/g,'<span class="ex-sf">$1</span>');
  return s;
}

function exHlBlank(tmpl,st,id){
  const parts=tmpl.split(/(\[\[B\d+\]\])/);
  return parts.map(function(p){
    if(/^\[\[B\d+\]\]$/.test(p)){
      const bid=p.slice(2,-2),val=st.bl[bid],chk=st.blChk;
      let cls='ex-blank';
      if(val)cls+=' filled';
      if(chk&&val)cls+=val===ExD[id].bl.ans[bid]?' ok':' er';
      if(!chk&&st.selTok&&!val)cls+=' ready-'+id;
      return '<span class="'+cls+'" data-exblank="'+bid+'" data-exalg="'+id+'">'+exEs(val||'\u00a0\u00a0\u00a0\u00a0\u00a0')+'</span>';
    }
    return exHl(p);
  }).join('');
}

function exProgDone(st,alg){
  return[st.blChk&&st.blSc===4,st.ordChk&&st.ordOk,st.mtChk&&st.mtSc===4,st.mcqChk&&st.mcqSc===ExD[alg].mcq.length];
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
function toggleExercises(questId){
  var el=document.getElementById(questId+'-exercises');
  var btn=document.getElementById(questId+'-toggle-btn');
  if(el.style.display==='none'){
    el.style.display='block';
    exRender(QUEST_MAP[questId]);
    if(btn)btn.textContent='\u25b2 Hide Theory & Exercises';
  }else{
    el.style.display='none';
    if(btn)btn.textContent='\ud83d\udcda Part 1: Theory & Interactive Exercises';
  }
}

// ─── Main Render ─────────────────────────────────────────────────────────────
function exRender(id){
  var d=ExD[id],st=ExS[id];
  var container=document.getElementById(id==='etc'?'quest1-exercises':'quest2-exercises');
  if(!container)return;
  if(!st.ord)st.ord=exShuf([...d.ord.items]);
  var done=exProgDone(st,id);
  var labels=['A \u2014 fill blanks','B \u2014 order steps','C \u2014 match concepts','D \u2014 reasoning'];
  var prog=labels.map(function(l,i){return '<span class="ex-prog-chip'+(done[i]?' done-'+id:'')+'">'+( done[i]?'\u2713 ':'' )+l+'</span>';}).join('');
  container.innerHTML=
    '<div class="ex-prog-row" style="margin-top:12px">'+prog+'</div>'+
    exRenderRef(id,d,st)+exRenderBlanks(id,d,st)+exRenderOrder(id,d,st)+exRenderMatch(id,d,st)+exRenderMCQ(id,d,st);
  exAttachDrag(id);
}

// ─── Reference Code ──────────────────────────────────────────────────────────
function exRenderRef(id,d,st){
  return '<div class="ex-card"><button class="ex-ref-toggle" onclick="exTogRef(\''+id+'\')">'+
    '\ud83d\udcc4 Reference code <span style="margin-left:auto;font-size:13px">'+(st.refOpen?'\u25b2':'\u25bc')+'</span></button>'+
    '<div class="ex-ref-body'+(st.refOpen?' open':'')+'" id="exrb-'+id+'"><div style="padding:12px">'+
    '<pre class="ex-code">'+exHl(d.code)+'</pre></div></div></div>';
}

// ─── Fill Blanks ─────────────────────────────────────────────────────────────
function exRenderBlanks(id,d,st){
  var usedVals=Object.values(st.bl).filter(Boolean);
  var bank=d.bl.opts.map(function(o){
    var used=usedVals.includes(o),sel=st.selTok===o;
    return '<span class="ex-tok'+(used?' ex-tok-used':sel?' sel-'+id:'')+'" data-extok="'+o+'" data-exalg="'+id+'">'+exEs(o)+'</span>';
  }).join('');
  var fb='';
  if(st.blChk){fb=st.blSc===4?'<div class="ex-fb ok">\u2713 All 4 blanks correct. Well done.</div>':'<div class="ex-fb er">\u2717 '+st.blSc+'/4 correct \u2014 red slots are wrong. Reset and try again.</div>';}
  return '<div class="ex-card"><div class="ex-card-hd"><div class="ex-badge ex-badge-'+id+'">A</div><span class="ex-card-title">Fill in the blanks</span></div>'+
    '<div class="ex-card-body"><p class="ex-instr">'+d.bl.instr+'</p><pre class="ex-code">'+exHlBlank(d.bl.tmpl,st,id)+'</pre>'+
    '<div class="ex-tok-bank">'+bank+'</div>'+fb+
    '<button class="ex-chk-btn" onclick="exChkBl(\''+id+'\')">Check blanks</button>'+
    (st.blChk&&st.blSc<4?'<button class="ex-rst-btn" onclick="exRstBl(\''+id+'\')">Reset</button>':'')+
    '</div></div>';
}

// ─── Order Steps ─────────────────────────────────────────────────────────────
function exRenderOrder(id,d,st){
  var items=st.ord.map(function(item,i){
    var cls='ex-ord-item';
    if(st.ordChk)cls+=item.id===d.ord.correct[i]?' pos-ok':' pos-er';
    return '<div class="'+cls+'" draggable="true" data-exoid="'+item.id+'" data-exalg="'+id+'" data-exi="'+i+'">'+
      '<span class="ex-grip">\u2807</span><span class="ex-ord-num">'+(i+1)+'</span><span>'+exEs(item.t)+'</span></div>';
  }).join('');
  var fb='';
  if(st.ordChk){var c=st.ord.filter(function(x,i){return x.id===d.ord.correct[i]}).length;
    fb=st.ordOk?'<div class="ex-fb ok">\u2713 Correct order! You\'ve nailed the execution flow.</div>':'<div class="ex-fb er">\u2717 '+c+'/4 in the right position \u2014 red-numbered items are misplaced.</div>';}
  return '<div class="ex-card"><div class="ex-card-hd"><div class="ex-badge ex-badge-'+id+'">B</div><span class="ex-card-title">Order the steps</span></div>'+
    '<div class="ex-card-body"><p class="ex-instr">'+d.ord.instr+'</p><div class="ex-ord-list" id="exol-'+id+'">'+items+'</div>'+fb+
    '<button class="ex-chk-btn" onclick="exChkOrd(\''+id+'\')">Check order</button>'+
    (st.ordChk?'<button class="ex-rst-btn" onclick="exRstOrd(\''+id+'\')">Reset</button>':'')+
    '</div></div>';
}

// ─── Match Concepts ──────────────────────────────────────────────────────────
function exRenderMatch(id,d,st){
  var usedDescs=Object.values(st.mt).filter(Boolean);
  var rows=d.mt.pairs.map(function(p){
    var placed=d.mt.descs.find(function(x){return x.id===st.mt[p.id]});
    var cls='ex-mslot';
    if(placed)cls+=' filled';
    if(st.mtChk&&placed)cls+=placed.id===p.did?' ok':' er';
    if(!st.mtChk&&st.selDesc&&!st.mt[p.id])cls+=' ready-'+id;
    return '<div class="ex-match-row"><span class="ex-match-code">'+exEs(p.code)+'</span><span class="ex-arr">\u2192</span>'+
      '<div class="'+cls+'" data-exslot="'+p.id+'" data-exalg="'+id+'">'+(placed?exEs(placed.t):'')+'</div></div>';
  }).join('');
  var chips=d.mt.descs.map(function(desc){
    var used=usedDescs.includes(desc.id),sel=st.selDesc===desc.id;
    return '<div class="ex-desc-chip'+(used?' ex-chip-used':sel?' sel-'+id:'')+'" data-exdesc="'+desc.id+'" data-exalg="'+id+'">'+exEs(desc.t)+'</div>';
  }).join('');
  var fb='';
  if(st.mtChk){var c=d.mt.pairs.filter(function(p){return st.mt[p.id]===p.did}).length;
    fb=c===4?'<div class="ex-fb ok">\u2713 All 4 matched correctly!</div>':'<div class="ex-fb er">\u2717 '+c+'/4 correct \u2014 red slots are mismatched.</div>';}
  return '<div class="ex-card"><div class="ex-card-hd"><div class="ex-badge ex-badge-'+id+'">C</div><span class="ex-card-title">Match the concepts</span></div>'+
    '<div class="ex-card-body"><p class="ex-instr">'+d.mt.instr+'</p><div class="ex-match-rows">'+rows+'</div>'+
    '<p class="ex-pool-label">Description pool</p><div class="ex-desc-pool">'+chips+'</div>'+fb+
    '<button class="ex-chk-btn" onclick="exChkMt(\''+id+'\')">Check matches</button>'+
    (st.mtChk&&st.mtSc<4?'<button class="ex-rst-btn" onclick="exRstMt(\''+id+'\')">Reset</button>':'')+
    '</div></div>';
}

// ─── MCQ ─────────────────────────────────────────────────────────────────────
function exRenderMCQ(id,d,st){
  var qs=d.mcq.map(function(q){
    var sel=st.mcq[q.id];
    var opts=q.opts.map(function(o){
      var cls='ex-opt';
      if(sel===o.id)cls+=' sel-'+id;
      if(st.mcqChk&&o.id===q.cor)cls+=' ok';
      else if(st.mcqChk&&sel===o.id&&o.id!==q.cor)cls+=' er';
      if(st.mcqChk)cls+=' ex-opt-dis';
      return '<div class="'+cls+'" onclick="exSelMcq(\''+id+"','"+q.id+"','"+o.id+'\')"><span class="ex-opt-ltr">'+o.id+'</span><span>'+exEs(o.t)+'</span></div>';
    }).join('');
    return '<div style="margin-bottom:14px"><p class="ex-mcq-q">'+exEs(q.q)+'</p><div class="ex-mcq-opts">'+opts+'</div></div>';
  }).join('');
  var fb='';
  if(st.mcqChk){var c=d.mcq.filter(function(q){return st.mcq[q.id]===q.cor}).length;
    fb=c===d.mcq.length?'<div class="ex-fb ok">\u2713 Both answers correct \u2014 excellent reasoning!</div>':'<div class="ex-fb er">\u2717 '+c+'/'+d.mcq.length+' correct \u2014 correct answers are highlighted in green.</div>';}
  return '<div class="ex-card"><div class="ex-card-hd"><div class="ex-badge ex-badge-'+id+'">D</div><span class="ex-card-title">Reasoning questions</span></div>'+
    '<div class="ex-card-body">'+qs+fb+'<button class="ex-chk-btn" onclick="exChkMcq(\''+id+'\')">Check answers</button></div></div>';
}

// ─── Check / Reset ───────────────────────────────────────────────────────────
function exTogRef(id){ExS[id].refOpen=!ExS[id].refOpen;exRender(id)}
function exChkBl(id){var st=ExS[id];st.blChk=true;st.blSc=Object.entries(st.bl).filter(function(e){return e[1]===ExD[id].bl.ans[e[0]]}).length;exRender(id)}
function exRstBl(id){var st=ExS[id];st.bl={B1:null,B2:null,B3:null,B4:null};st.selTok=null;st.blChk=false;st.blSc=0;exRender(id)}
function exChkOrd(id){var st=ExS[id];st.ordChk=true;st.ordOk=st.ord.every(function(x,i){return x.id===ExD[id].ord.correct[i]});exRender(id)}
function exRstOrd(id){var st=ExS[id];st.ord=exShuf([...ExD[id].ord.items]);st.ordChk=false;st.ordOk=false;exRender(id)}
function exChkMt(id){var st=ExS[id];st.mtChk=true;st.mtSc=ExD[id].mt.pairs.filter(function(p){return st.mt[p.id]===p.did}).length;exRender(id)}
function exRstMt(id){var st=ExS[id];st.mt={m1:null,m2:null,m3:null,m4:null};st.selDesc=null;st.mtChk=false;st.mtSc=0;exRender(id)}
function exSelMcq(id,qid,oid){if(ExS[id].mcqChk)return;ExS[id].mcq[qid]=oid;exRender(id)}
function exChkMcq(id){var st=ExS[id];st.mcqChk=true;st.mcqSc=ExD[id].mcq.filter(function(q){return st.mcq[q.id]===q.cor}).length;exRender(id)}

// ─── Click Handlers ──────────────────────────────────────────────────────────
document.addEventListener('click',function(e){
  var tok=e.target.closest('[data-extok]');
  if(tok){var id=tok.dataset.exalg,st=ExS[id];if(st.blChk)return;var v=tok.dataset.extok;st.selTok=st.selTok===v?null:v;exRender(id);return}
  var blank=e.target.closest('[data-exblank]');
  if(blank){var id=blank.dataset.exalg,st=ExS[id];if(st.blChk)return;var bid=blank.dataset.exblank,cur=st.bl[bid];if(cur){st.bl[bid]=null;st.selTok=cur;}else if(st.selTok){st.bl[bid]=st.selTok;st.selTok=null;}exRender(id);return}
  var desc=e.target.closest('[data-exdesc]');
  if(desc){var id=desc.dataset.exalg,st=ExS[id];if(st.mtChk)return;var v=desc.dataset.exdesc;st.selDesc=st.selDesc===v?null:v;exRender(id);return}
  var slot=e.target.closest('[data-exslot]');
  if(slot){var id=slot.dataset.exalg,st=ExS[id];if(st.mtChk)return;var sid=slot.dataset.exslot,cur=st.mt[sid];if(cur){st.mt[sid]=null;st.selDesc=cur;}else if(st.selDesc){st.mt[sid]=st.selDesc;st.selDesc=null;}exRender(id);return}
});

// ─── Drag & Drop ─────────────────────────────────────────────────────────────
var exDragSrc=null,exDragAlg=null,exDragIdx=null;
function exAttachDrag(id){
  document.querySelectorAll('.ex-ord-item[data-exalg="'+id+'"]').forEach(function(el){
    el.addEventListener('dragstart',function(e){
      exDragSrc=this;exDragAlg=this.dataset.exalg;exDragIdx=parseInt(this.dataset.exi);
      this.classList.add('dragging');e.dataTransfer.effectAllowed='move';
    });
    el.addEventListener('dragover',function(e){e.preventDefault();if(this!==exDragSrc)this.classList.add('over');});
    el.addEventListener('dragleave',function(){this.classList.remove('over');});
    el.addEventListener('dragend',function(){this.classList.remove('dragging');document.querySelectorAll('.ex-ord-item').forEach(function(x){x.classList.remove('over')});});
    el.addEventListener('drop',function(e){
      e.preventDefault();this.classList.remove('over');
      var ti=parseInt(this.dataset.exi),aid=this.dataset.exalg;
      if(exDragIdx!==ti&&exDragAlg===aid){
        var st=ExS[aid],arr=st.ord;
        var item=arr.splice(exDragIdx,1)[0];arr.splice(ti,0,item);
        st.ordChk=false;exRender(aid);
      }
    });
  });
}

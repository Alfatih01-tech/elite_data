const $ = id => document.getElementById(id);
let token = localStorage.getItem('eliteToken') || '';
let currentService = 'Data';
let authMode = 'login';

function money(n) { return '₦' + Number(n || 0).toLocaleString('en-NG', {minimumFractionDigits:2, maximumFractionDigits:2}); }
function toast(msg) { $('toast').textContent = msg; $('toast').classList.remove('hidden'); setTimeout(() => $('toast').classList.add('hidden'), 3800); }
async function api(url, options={}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type':'application/json', ...(token ? {Authorization:'Bearer '+token} : {}), ...(options.headers||{}) }});
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'An samu matsala. Gwada kuma.');
  return data;
}
function setLoggedIn(isIn, user) {
  $('authButton').textContent = isIn ? 'Sign out' : 'Sign in';
  $('greeting').textContent = isIn ? `Barka da zuwa, ${user.name.split(' ')[0]}! 👋` : 'Good morning! 👋';
  $('balance').textContent = money(user.balance);
  $('walletNote').textContent = isIn ? 'Elite Data wallet balance (demo)' : 'Shiga account don amfani da wallet';
}
async function refresh() {
  if (!token) { setLoggedIn(false,{name:'',balance:0}); return; }
  try {
    const data = await api('/api/me');
    setLoggedIn(true,data.user); renderHistory(data.transactions);
  } catch { token=''; localStorage.removeItem('eliteToken'); setLoggedIn(false,{name:'',balance:0}); }
}
function openAuth(mode='login') {
  authMode=mode; $('modalTitle').textContent=mode==='login'?'Sign in':'Create account';
  $('modalDescription').textContent=mode==='login'?'Shiga account ɗinka na Elite Data.':'Ƙirƙiri account domin gwada website ɗin.';
  $('nameWrap').classList.toggle('hidden',mode==='login');
  $('name').required=mode==='register';
  $('authSubmit').textContent=mode==='login'?'Sign in':'Create account';
  $('toggleAuth').textContent=mode==='login'?'Sabon account? Yi rajista':'Kana da account? Sign in';
  $('modalMessage').textContent=''; $('modal').classList.remove('hidden');
}
$('closeModal').onclick=()=>$('modal').classList.add('hidden');
$('modal').addEventListener('click',e=>{if(e.target===$('modal')) $('modal').classList.add('hidden')});
$('toggleAuth').onclick=()=>openAuth(authMode==='login'?'register':'login');
$('authButton').onclick=()=>{ if(token){token='';localStorage.removeItem('eliteToken');refresh();toast('Ka fita daga account.')}else openAuth('login'); };
$('authForm').onsubmit=async e=>{
  e.preventDefault(); $('modalMessage').textContent='Ana aiki...';
  try {
    const payload={email:$('email').value.trim(),password:$('password').value};
    if(authMode==='register') payload.name=$('name').value.trim();
    const data=await api('/api/'+(authMode==='login'?'login':'register'),{method:'POST',body:JSON.stringify(payload)});
    token=data.token;localStorage.setItem('eliteToken',token);$('modal').classList.add('hidden');await refresh();toast('An shiga account cikin nasara.');
  } catch(err){$('modalMessage').textContent=err.message;}
};
$('fundButton').onclick=async()=>{
  if(!token)return openAuth('login');
  const answer=prompt('Demo wallet funding (₦100 zuwa ₦100,000). Ba za a karɓi kuɗi na gaske ba. Shigar da adadi:','1000');
  if(answer===null)return;
  try{const d=await api('/api/demo-fund-wallet',{method:'POST',body:JSON.stringify({amount:Number(answer)})});$('balance').textContent=money(d.balance);await refresh();toast(d.message);}
  catch(e){toast(e.message);}
};
document.querySelectorAll('.service').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.service').forEach(b=>b.classList.remove('active'));btn.classList.add('active');
  currentService=btn.dataset.service;
  const purchase=currentService==='Data'||currentService==='Airtime';
  $('purchasePanel').classList.toggle('hidden',!purchase);$('historyPanel').classList.toggle('hidden',currentService!=='History');
  if(currentService==='Account'){if(token)openAccount();else openAuth('login');}
  if(purchase){$('purchaseTitle').textContent=currentService==='Data'?'Buy Data':'Buy Airtime';$('planWrap').classList.toggle('hidden',currentService==='Airtime');$('plan').required=currentService==='Data';$('amount').placeholder=currentService==='Data'?'500':'100';$('buyButton').textContent=currentService==='Data'?'Buy Data (Demo)':'Buy Airtime (Demo)';}
  if(currentService==='History'&&!token)openAuth('login');
});
function openAccount(){toast('Ana amfani da Elite Data ne a demo mode.');}
$('purchaseForm').onsubmit=async e=>{
  e.preventDefault();if(!token)return openAuth('login');
  const payload={type:currentService,network:document.querySelector('input[name="network"]:checked').value,phone:$('phone').value.trim(),amount:Number($('amount').value),plan:$('plan').value};
  if(!confirm(`Tabbatar da DEMO ${currentService} zuwa ${payload.phone} akan ${money(payload.amount)}? Ba a aika sabis na gaske ba.`))return;
  $('buyButton').disabled=true;
  try{const d=await api('/api/purchase',{method:'POST',body:JSON.stringify(payload)});$('balance').textContent=money(d.balance);await refresh();toast(d.message);}
  catch(err){toast(err.message);}
  finally{$('buyButton').disabled=false;}
};
function renderHistory(items=[]){
  $('historyList').innerHTML='';
  if(!items.length){$('historyList').innerHTML='<p class="muted">Babu transactions tukuna.</p>';return;}
  items.forEach(t=>{const row=document.createElement('div');row.className='history-item';const left=document.createElement('div');const title=document.createElement('b');title.textContent=`${t.type} ${t.network||''}`;const small=document.createElement('small');small.textContent=`${t.phone||'Wallet'} · ${new Date(t.createdAt).toLocaleString()}`;left.append(title,small);const right=document.createElement('strong');right.textContent=money(t.amount);row.append(left,right);$('historyList').append(row);});
}
$('year').textContent=new Date().getFullYear();
refresh();

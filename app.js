const KEY='pilkades_bantarsari_demo_v1';

const initial={
candidates:[
{id:1,no:1,name:'Calon 1'},
{id:2,no:2,name:'Calon 2'},
{id:3,no:3,name:'Agus Sopian, S.T.'}
],
voters:[
...Array.from({length:5},(_,i)=>({id:'D1-'+(i+1),tps:1,used:false})),
...Array.from({length:5},(_,i)=>({id:'D2-'+(i+1),tps:2,used:false})),
...Array.from({length:5},(_,i)=>({id:'D3-'+(i+1),tps:3,used:false}))
],
votes:[]
};

function load(){
return JSON.parse(localStorage.getItem(KEY)||JSON.stringify(initial));
}

function save(d){
localStorage.setItem(KEY,JSON.stringify(d));
}

function renderHome(){
document.getElementById('app').innerHTML=`
<section class="hero">
<h1>Pilkades Desa Bantarsari</h1>
<p>Prototype pemilihan kepala desa — mode simulasi</p>

<div class="card">
<h3>Verifikasi Pemilih</h3>
<label>Nomor DPT demo</label>
<input id="vid" class="input" placeholder="Contoh: D1-1">

<button class="btn" onclick="verify()">Lanjut</button>

<p class="small muted">
Data demo: D1-1 s.d. D1-5, D2-1 s.d. D2-5, D3-1 s.d. D3-5.
</p>
</div>
</section>`;
}

function verify(){
const id=document.getElementById('vid').value.trim().toUpperCase();
const d=load();
const v=d.voters.find(x=>x.id===id);

if(!v){
alert('Nomor DPT tidak ditemukan pada data demo.');
return;
}

if(v.used){
alert('Pemilih ini sudah menggunakan hak pilih pada demo.');
return;
}

window.currentVoter=id;
renderVote(v);
}

function renderVote(v){
const d=load();

document.getElementById('app').innerHTML=`
<div class="topline">
<h2>Pemilihan</h2>
<span>TPS ${v.tps}</span>
</div>

<div class="card">
<p>Nomor DPT: <b>${v.id}</b></p>
<p class="muted">Silakan pilih satu calon.</p>

<div class="grid">
${d.candidates.map(c=>`
<div class="candidate" id="c${c.id}" onclick="pick(${c.id})">
<div class="num">${c.no}</div>
<h3>${c.name}</h3>
<span class="muted">Calon Kepala Desa</span>
</div>
`).join('')}
</div>

<br>

<button class="btn" onclick="confirmVote()">
Konfirmasi Pilihan
</button>

<button class="btn secondary" onclick="renderHome()">
Batal
</button>

</div>`;
window.choice=null;
}

function pick(id){
window.choice=id;

document.querySelectorAll('.candidate')
.forEach(x=>x.classList.remove('selected'));

document.getElementById('c'+id)
.classList.add('selected');
}

function confirmVote(){

if(!window.choice){
alert('Pilih calon terlebih dahulu.');
return;
}

if(!confirm('Yakin dengan pilihan ini? Dalam mode demo, pilihan tidak dapat dibatalkan.')){
return;
}

const d=load();
const v=d.voters.find(x=>x.id===window.currentVoter);

if(!v||v.used){
alert('Pemilih sudah digunakan.');
return;
}

v.used=true;

d.votes.push({
voterId:v.id,
tps:v.tps,
candidateId:window.choice,
time:new Date().toISOString()
});

save(d);

document.getElementById('app').innerHTML=`
<div class="card hero">
<h2>✓ Pemilihan Berhasil</h2>
<p>Hak pilih <b>${v.id}</b> telah dicatat pada demo.</p>
<button class="btn" onclick="renderHome()">Kembali</button>
</div>`;
}

function showAdmin(){

const d=load();

const total=d.voters.length;
const used=d.voters.filter(v=>v.used).length;

document.getElementById('app').innerHTML=`
<div class="topline">
<h2>Dashboard Panitia</h2>
<button class="btn secondary" onclick="renderHome()">
Halaman Pemilih
</button>
</div>

<div class="stats">

<div class="stat">
<b>${total}</b>
DPT Demo
</div>

<div class="stat">
<b>${used}</b>
Sudah Memilih
</div>

<div class="stat">
<b>${total-used}</b>
Belum Memilih
</div>

</div>

<div class="card">
<h3>Rekap Suara</h3>

${d.candidates.map(c=>{

let n=d.votes.filter(v=>v.candidateId===c.id).length;
let p=used?Math.round(n/used*100):0;

return `
<p>
<b>No. ${c.no} — ${c.name}</b>
· ${n} suara (${p}%)
</p>

<div class="bar">
<div class="fill" style="width:${p}%"></div>
</div>`;

}).join('')}

</div>

<div class="card">
<h3>Rekap per TPS</h3>

${[1,2,3].map(t=>{

let all=d.voters.filter(v=>v.tps===t).length;
let u=d.voters.filter(v=>v.tps===t&&v.used).length;

return `
<p>
<b>TPS ${t}</b>:
${u}/${all} pemilih demo sudah memilih
</p>`;

}).join('')}

</div>

<div class="card">
<h3>Kontrol Demo</h3>

<button class="btn secondary" onclick="resetDemo()">
Reset seluruh data demo
</button>

<p class="small danger">
Reset hanya menghapus data simulasi di browser ini.
</p>

</div>`;
}

function resetDemo(){

if(confirm('Reset data demo?')){
localStorage.removeItem(KEY);
showAdmin();
}

}

renderHome();

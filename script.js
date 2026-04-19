// Scroll top
window.addEventListener('scroll', function() {
  var btn = document.getElementById('goTop');
  if (!btn) return;
  if (window.scrollY > 300) btn.classList.add('show');
  else btn.classList.remove('show');
});
var goTopBtn = document.getElementById('goTop');
if (goTopBtn) goTopBtn.addEventListener('click', function() { window.scrollTo({top:0}); });

// FAQ accordion
document.querySelectorAll('.faq-q').forEach(function(q) {
  q.addEventListener('click', function() {
    var ans  = q.nextElementSibling;
    var icon = q.querySelector('.faq-icon');
    if (ans.style.display === 'block') {
      ans.style.display = 'none';
      if (icon) icon.textContent = '+';
    } else {
      document.querySelectorAll('.faq-a').forEach(function(a) { a.style.display = 'none'; });
      document.querySelectorAll('.faq-icon').forEach(function(i) { i.textContent = '+'; });
      ans.style.display = 'block';
      if (icon) icon.textContent = '−';
    }
  });
});

//  localStorage
var STORAGE_KEY = 'appPinkyPesanan';

function loadPesanan() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch(e) { return []; }
}

function savePesanan(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Harga & durasi
var appPrices   = {
  'Microsoft 365 Personal':149000,'Microsoft 365 Family':229000,
  'Adobe Creative Cloud':349000,'Adobe Photoshop':199000,'Canva Pro':109000,
  'Notion Premium':89000,'ChatGPT Plus (OpenAI)':299000,'Grammarly Premium':119000,
  'Spotify Premium':59000,'Netflix Standard':149000,'YouTube Premium':89000,
  'NordVPN (1 Tahun)':299000,'Zoom Pro':229000,'GitHub Copilot':199000
};
var appDuration = {'1 Bulan':1,'3 Bulan':3,'6 Bulan':6,'12 Bulan':12};
var appDiscount = {'1 Bulan':0,'3 Bulan':0.05,'6 Bulan':0.10,'12 Bulan':0.15};

function calcTotal() {
  var appEl = document.getElementById('appName');
  var durEl = document.getElementById('duration');
  var totEl = document.getElementById('totalHarga');
  if (!appEl||!durEl||!totEl) return;
  var p = appPrices[appEl.value]||0;
  var d = appDuration[durEl.value]||1;
  var c = appDiscount[durEl.value]||0;
  totEl.value = p > 0 ? 'Rp '+Math.round(p*d*(1-c)).toLocaleString('id-ID') : '';
}
var appNameEl = document.getElementById('appName');
var durationEl= document.getElementById('duration');
if (appNameEl)  appNameEl.addEventListener('change', calcTotal);
if (durationEl) durationEl.addEventListener('change', calcTotal);

// SUBMIT FORM 
var orderForm = document.getElementById('orderForm');
if (orderForm) {
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var nama  = (document.getElementById('custName')  ||{}).value||'';
    var wa    = (document.getElementById('custWA')    ||{}).value||'';
    var email = (document.getElementById('custEmail') ||{}).value||'';
    var app   = (document.getElementById('appName')   ||{}).value||'';
    var dur   = (document.getElementById('duration')  ||{}).value||'';
    var bayar = (document.getElementById('payMethod') ||{}).value||'';
    var total = (document.getElementById('totalHarga')||{}).value||'';
    var catat = (document.getElementById('notes')     ||{}).value||'';
    nama=nama.trim(); wa=wa.trim(); app=app.trim();

    if (!nama||!wa||!app) { alert('Mohon lengkapi data wajib (*)'); return; }

    var data  = loadPesanan();
    var idBaru= data.length>0 ? Math.max.apply(null,data.map(function(p){return p.id;}))+1 : 1;
    var tgl   = new Date().toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'2-digit'});

    data.push({id:idBaru,nama:nama,wa:wa,email:email,app:app,dur:dur,
               total:total,bayar:bayar,catatan:catat,status:'Pending',tanggal:tgl});
    savePesanan(data);

    var al = document.getElementById('orderAlert');
    if (al) {
      al.style.display='block';
      al.innerHTML='✅ Pesanan <strong>'+nama+'</strong> berhasil disimpan! Admin akan WA <strong>'+wa+'</strong>.';
      setTimeout(function(){al.style.display='none';},6000);
    }
    orderForm.reset();
    var tEl=document.getElementById('totalHarga'); if(tEl) tEl.value='';
    renderTabel();
  });
}

//RENDER TABEL dari localStorage 
function renderTabel() {
  var tbody = document.getElementById('orderBody');
  if (!tbody) return;
  var data = loadPesanan();

  // Filter cari
  var cariEl = document.getElementById('cariInput');
  var cari   = cariEl ? cariEl.value.toLowerCase() : '';
  if (cari) {
    data = data.filter(function(p){
      return p.nama.toLowerCase().indexOf(cari)!==-1
          || p.app.toLowerCase().indexOf(cari)!==-1
          || p.wa.toLowerCase().indexOf(cari)!==-1;
    });
  }

  if (data.length===0) {
    tbody.innerHTML='<tr class="no-data"><td colspan="10" style="text-align:center;padding:3rem;color:var(--muted)"><i class="bi bi-inbox" style="font-size:2.5rem;display:block;margin-bottom:.5rem;opacity:.4"></i><strong>Belum ada pesanan</strong><br><small>Isi form di sebelah kiri</small></td></tr>';
    updateSummary(); return;
  }

  var html='';
  data.slice().reverse().forEach(function(p){
    var cls={'Pending':'s-pending','Diproses':'s-proses','Selesai':'s-selesai','Dibatalkan':'s-batal'}[p.status]||'s-pending';
    html+='<tr>'+
      '<td><span style="background:#FDF0F8;color:var(--primary);padding:2px 8px;border-radius:4px;font-weight:700;font-size:.78rem">#'+String(p.id).padStart(3,'0')+'</span></td>'+
      '<td><strong>'+esc(p.nama)+'</strong><br><small style="color:var(--muted)">'+esc(p.wa)+'</small></td>'+
      '<td style="font-size:.83rem">'+esc(p.app)+'</td>'+
      '<td style="font-size:.83rem">'+esc(p.dur)+'</td>'+
      '<td><strong style="color:var(--primary)">'+(p.total||'-')+'</strong></td>'+
      '<td style="font-size:.82rem">'+esc(p.bayar)+'</td>'+
      '<td style="font-size:.82rem">'+(p.email||'-')+'</td>'+
      '<td style="font-size:.8rem;color:var(--muted)">'+p.tanggal+'</td>'+
      '<td><span class="status-pill '+cls+'">'+p.status+'</span></td>'+
      '<td>'+
        '<button class="btn-tbl btn-tbl-done me-1" onclick="ubahStatus('+p.id+')">Selesai</button>'+
        '<button class="btn-tbl btn-tbl-del" onclick="hapusSatu('+p.id+')">Hapus</button>'+
      '</td>'+
    '</tr>';
  });
  tbody.innerHTML=html;
  updateSummary();
}

function esc(s){
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ubahStatus(id) {
  var data=loadPesanan().map(function(p){if(p.id===id)p.status='Selesai';return p;});
  savePesanan(data); renderTabel();
}

function hapusSatu(id) {
  if(!confirm('Hapus pesanan ini?')) return;
  savePesanan(loadPesanan().filter(function(p){return p.id!==id;}));
  renderTabel();
}

function clearAll() {
  if(!confirm('Hapus semua data pesanan?')) return;
  localStorage.removeItem(STORAGE_KEY);
  renderTabel();
}

function updateSummary() {
  var data    = loadPesanan();
  var total   = data.length;
  var selesai = data.filter(function(p){return p.status==='Selesai';}).length;
  var pending = data.filter(function(p){return p.status==='Pending';}).length;
  var el;
  el=document.getElementById('countTotal');   if(el) el.textContent=total;
  el=document.getElementById('countSelesai'); if(el) el.textContent=selesai;
  el=document.getElementById('countPending'); if(el) el.textContent=pending;
  el=document.getElementById('orderCount');   if(el) el.textContent=total;
}

function searchOrders(val) { renderTabel(); }

//load data dari localStorage 
document.addEventListener('DOMContentLoaded', function() {
  renderTabel();
});

// Contact form
var contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    var al=document.getElementById('contactAlert');
    if(al){ al.style.display='block'; al.innerHTML='✅ Pesan terkirim! Tim kami akan membalas dalam 1×24 jam.'; setTimeout(function(){al.style.display='none';},5000); }
    contactForm.reset();
  });
}
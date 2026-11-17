const Analytics = (() => {
  let cashflow=null,category=null,analyticsLine=null,analyticsDonut=null;
  const palette=['#20ad5b','#f0a34a','#588fe8','#a47ad9','#e87575','#4ab6b0','#9ca3af','#df83b5','#8eaa54','#e2c15d'];
  const fmt=n=>new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n||0);
  function range(period){
    const now=new Date(),start=new Date(now.getFullYear(),now.getMonth(),now.getDate()),end=new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59,999);
    if(period==='today')return [start,end];
    if(period==='7'){start.setDate(start.getDate()-6);return [start,end];}
    if(period==='30'){start.setDate(start.getDate()-29);return [start,end];}
    if(period==='lastMonth')return [new Date(now.getFullYear(),now.getMonth()-1,1),new Date(now.getFullYear(),now.getMonth(),0,23,59,59,999)];
    if(period==='year')return [new Date(now.getFullYear(),0,1),end];
    if(period==='all')return [new Date(2000,0,1),end];
    return [new Date(now.getFullYear(),now.getMonth(),1),end];
  }
  function filter(list,period){const [a,b]=range(period);return list.filter(t=>{const d=new Date(t.date+'T'+(t.time||'00:00'));return d>=a&&d<=b;});}
  function sums(list){const income=list.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0),expense=list.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0);return {income,expense,net:income-expense,count:list.length};}
  function bucket(list,period){
    const map=new Map(),labels=[];
    const [start,end]=range(period);
    const monthly=period==='year'||period==='all';
    if(monthly){
      let d=new Date(start.getFullYear(),start.getMonth(),1);
      while(d<=end&&labels.length<60){const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;const label=d.toLocaleDateString('id-ID',{month:'short',year:'2-digit'});labels.push(label);map.set(key,{income:0,expense:0});d.setMonth(d.getMonth()+1);}
    } else {
      let d=new Date(start.getFullYear(),start.getMonth(),start.getDate());
      while(d<=end&&labels.length<100){const key=d.toISOString().slice(0,10);const label=d.toLocaleDateString('id-ID',{day:'2-digit',month:'short'});labels.push(label);map.set(key,{income:0,expense:0});d.setDate(d.getDate()+1);}
    }
    list.forEach(t=>{const d=new Date(t.date+'T00:00:00');const key=monthly?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`:t.date;const b=map.get(key);if(b)b[t.type]+=Number(t.amount);});
    return {labels,income:Array.from(map.values(),v=>v.income),expense:Array.from(map.values(),v=>v.expense)};
  }
  function categoryTotals(list){const map={};list.filter(t=>t.type==='expense').forEach(t=>map[t.category]=(map[t.category]||0)+Number(t.amount));return Object.entries(map).sort((a,b)=>b[1]-a[1]);}
  function chartOptions(){const dark=document.body.classList.contains('dark');return {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:dark?'#17231c':'#17231c',padding:10,titleFont:{family:'Poppins'},bodyFont:{family:'Poppins'},callbacks:{label:c=>' '+fmt(c.raw)}}},scales:{x:{grid:{display:false},ticks:{color:dark?'#9aaca0':'#829087',font:{family:'Poppins',size:9}}},y:{beginAtZero:true,grid:{color:dark?'#2b3a30':'#edf1ed'},ticks:{color:dark?'#9aaca0':'#829087',font:{family:'Poppins',size:9},callback:v=>v>=1000000?(v/1000000)+' jt':v>=1000?(v/1000)+' rb':v}}}};}
  function lineConfig(canvasId,list,period){const c=bucket(list,period),ctx=document.getElementById(canvasId);if(!ctx)return null;return new Chart(ctx,{type:'line',data:{labels:c.labels,datasets:[{label:'Pemasukan',data:c.income,borderColor:'#20ad5b',backgroundColor:'rgba(32,173,91,.08)',fill:true,tension:.38,pointRadius:2,pointHoverRadius:5,borderWidth:2},{label:'Pengeluaran',data:c.expense,borderColor:'#ed7771',backgroundColor:'rgba(237,119,113,.05)',fill:true,tension:.38,pointRadius:2,pointHoverRadius:5,borderWidth:2}]},options:{...chartOptions(),interaction:{intersect:false,mode:'index'}}});}
  function donutConfig(canvasId,list){const totals=categoryTotals(list),ctx=document.getElementById(canvasId);if(!ctx)return null;return new Chart(ctx,{type:'doughnut',data:{labels:totals.map(x=>x[0]),datasets:[{data:totals.map(x=>x[1]),backgroundColor:totals.map((_,i)=>palette[i%palette.length]),borderWidth:0,hoverOffset:5}]},options:{responsive:true,maintainAspectRatio:false,cutout:'72%',plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>` ${c.label}: ${fmt(c.raw)}`}}}}});}
  function destroy(ch){if(ch)ch.destroy();}
  function renderDashboard(period='month'){const all=Store.all(),filtered=filter(all,period),s=sums(filtered),balance=sums(all);const hidden=Store.settings().hideBalance;
    document.getElementById('totalBalance').textContent=hidden?'••••••••':fmt(balance.net);document.getElementById('totalIncome').textContent=fmt(s.income);document.getElementById('totalExpense').textContent=fmt(s.expense);document.getElementById('netSavings').textContent=fmt(s.net);document.getElementById('incomeCount').textContent=filtered.filter(t=>t.type==='income').length+' transaksi';document.getElementById('expenseCount').textContent=filtered.filter(t=>t.type==='expense').length+' transaksi';document.getElementById('savingRate').textContent=(s.income?Math.round(s.net/s.income*100):0)+'% saving rate';
    document.getElementById('doughnutTotal').textContent=fmt(s.expense);destroy(cashflow);destroy(category);cashflow=lineConfig('cashflowChart',filtered,period);category=donutConfig('categoryChart',filtered);renderLegend(filtered);return filtered;
  }
  function renderLegend(list){const el=document.getElementById('categoryLegend');if(!el)return;const totals=categoryTotals(list);el.innerHTML=totals.length?totals.slice(0,6).map((x,i)=>`<div class="legend-item"><i class="legend-swatch" style="background:${palette[i%palette.length]}"></i><span>${escapeHtml(x[0])}</span></div>`).join(''):'<span class="muted small">Belum ada pengeluaran</span>';}
  function renderAnalytics(period='month'){const list=filter(Store.all(),period),s=sums(list);['analyticsIncome','analyticsExpense','analyticsNet','analyticsCount'].forEach((id,i)=>document.getElementById(id).textContent=[fmt(s.income),fmt(s.expense),fmt(s.net),s.count][i]);destroy(analyticsLine);destroy(analyticsDonut);analyticsLine=lineConfig('analyticsLineChart',list,period);analyticsDonut=donutConfig('analyticsDoughnutChart',list);}
  function refresh(){const p=document.getElementById('dashboardPeriod')?.value||'month';renderDashboard(p);renderAnalytics(document.getElementById('analyticsPeriod')?.value||p);}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  return {fmt,range,filter,sums,categoryTotals,renderDashboard,renderAnalytics,refresh};
})();

/* FINTRACK local storage layer */
const Store = (() => {
  const KEY = 'fintrack_data_v1';
  const defaultCategories = [
    {id:'inc-salary',name:'Gaji',type:'income',icon:'bi-wallet2',custom:false},
    {id:'inc-business',name:'Bisnis',type:'income',icon:'bi-briefcase',custom:false},
    {id:'inc-freelance',name:'Freelance',type:'income',icon:'bi-laptop',custom:false},
    {id:'inc-investment',name:'Investasi',type:'income',icon:'bi-graph-up',custom:false},
    {id:'inc-transfer',name:'Transfer Masuk',type:'income',icon:'bi-arrow-down-left',custom:false},
    {id:'inc-other',name:'Pemasukan Lainnya',type:'income',icon:'bi-plus-circle',custom:false},
    {id:'exp-food',name:'Makanan & Minuman',type:'expense',icon:'bi-cup-hot',custom:false},
    {id:'exp-transport',name:'Transportasi',type:'expense',icon:'bi-car-front',custom:false},
    {id:'exp-shopping',name:'Belanja',type:'expense',icon:'bi-bag',custom:false},
    {id:'exp-bills',name:'Tagihan & Utilitas',type:'expense',icon:'bi-receipt',custom:false},
    {id:'exp-entertainment',name:'Hiburan',type:'expense',icon:'bi-controller',custom:false},
    {id:'exp-health',name:'Kesehatan',type:'expense',icon:'bi-heart-pulse',custom:false},
    {id:'exp-education',name:'Pendidikan',type:'expense',icon:'bi-book',custom:false},
    {id:'exp-housing',name:'Tempat Tinggal',type:'expense',icon:'bi-house',custom:false},
    {id:'exp-digital',name:'Layanan Digital',type:'expense',icon:'bi-phone',custom:false},
    {id:'exp-transfer',name:'Transfer',type:'expense',icon:'bi-arrow-up-right',custom:false},
    {id:'exp-other',name:'Pengeluaran Lainnya',type:'expense',icon:'bi-three-dots',custom:false}
  ];
  const defaults = () => ({transactions:[],categories:defaultCategories,settings:{theme:'light',hideBalance:false,autoDetect:true}});
  let data;
  function load(){try{const raw=localStorage.getItem(KEY);data=raw?{...defaults(),...JSON.parse(raw)}:defaults();if(!Array.isArray(data.transactions))data.transactions=[];if(!Array.isArray(data.categories))data.categories=defaultCategories;data.settings={...defaults().settings,...(data.settings||{})};}catch(e){data=defaults();}return data;}
  function save(){localStorage.setItem(KEY,JSON.stringify(data));}
  function all(){return data.transactions.slice();}
  function add(tx){data.transactions.push(tx);save();return tx;}
  function update(id,patch){const i=data.transactions.findIndex(t=>t.id===id);if(i<0)return false;data.transactions[i]={...data.transactions[i],...patch};save();return true;}
  function remove(id){data.transactions=data.transactions.filter(t=>t.id!==id);save();}
  function clearTransactions(){data.transactions=[];save();}
  function categories(type){return data.categories.filter(c=>!type||c.type===type);}
  function addCategory(name,type){const c={id:'cat-'+Date.now().toString(36),name,type,icon:type==='income'?'bi-plus-circle':'bi-tag',custom:true};data.categories.push(c);save();return c;}
  function removeCategory(id){const c=data.categories.find(x=>x.id===id);if(!c||!c.custom)return false;data.categories=data.categories.filter(x=>x.id!==id);save();return true;}
  function settings(){return data.settings;}
  function setSetting(k,v){data.settings[k]=v;save();}
  function exportData(){return JSON.stringify({version:1,exportedAt:new Date().toISOString(),...data},null,2);}
  function importData(obj){if(!obj||!Array.isArray(obj.transactions)||!Array.isArray(obj.categories))throw new Error('Format backup tidak valid');data={...defaults(),transactions:obj.transactions,categories:obj.categories,settings:{...defaults().settings,...obj.settings}};save();}
  function reset(){data=defaults();save();}
  load();
  return {load,save,all,add,update,remove,clearTransactions,categories,addCategory,removeCategory,settings,setSetting,exportData,importData,reset,defaults};
})();

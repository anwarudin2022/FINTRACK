const Settings = (() => {
  function init(){document.getElementById('settingsTheme').addEventListener('click',()=>App.toggleTheme());document.getElementById('exportJson').addEventListener('click',exportJson);document.getElementById('importJson').addEventListener('change',importJson);document.getElementById('resetData').addEventListener('click',()=>{if(confirm('Reset seluruh transaksi, kategori, dan preferensi FINTRACK? Data tidak dapat dipulihkan.')){Store.reset();App.applyTheme();Transactions.refresh();Categories.render();Analytics.refresh();App.toast('Data FINTRACK berhasil direset.');}});}
  function exportJson(){Transactions.download(Store.exportData(),'fintrack-backup.json','application/json');}
  async function importJson(e){const file=e.target.files[0];if(!file)return;try{const obj=JSON.parse(await file.text());Store.importData(obj);App.applyTheme();Transactions.refresh();Categories.render();Analytics.refresh();App.toast('Backup berhasil dipulihkan.');}catch(err){alert('Gagal mengimpor backup: '+err.message);}e.target.value='';}
  return {init,exportJson};
})();

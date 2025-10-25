/* Sidebar toggle and image upload handling */
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.getElementById('sidebar');
  const toggle = document.getElementById('sidebar-toggle');
  const nav = document.getElementById('sidebar-nav');

  // Restore state
  if (localStorage.getItem('sidebarExpanded') === 'true') {
    sidebar.classList.add('expanded');
    nav.classList.remove('hidden');
  }

  toggle.addEventListener('click', () => {
    const expanded = sidebar.classList.toggle('expanded');
    if (expanded) nav.classList.remove('hidden'); else nav.classList.add('hidden');
    localStorage.setItem('sidebarExpanded', expanded);
    toggle.title = expanded ? 'Close menu' : 'Open menu';
  });

  // Upload area
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('file-input');
  const gallery = document.getElementById('gallery');
  const createBtn = document.getElementById('create-recipe');

  function preventDefaults(e){ e.preventDefault(); e.stopPropagation(); }
  ['dragenter','dragover','dragleave','drop'].forEach(evt=>{
    uploadArea.addEventListener(evt, preventDefaults, false);
  });

  ['dragenter','dragover'].forEach(evt=>{
    uploadArea.addEventListener(evt, ()=> uploadArea.classList.add('dragover'), false);
  });
  ['dragleave','drop'].forEach(evt=>{
    uploadArea.addEventListener(evt, ()=> uploadArea.classList.remove('dragover'), false);
  });

  uploadArea.addEventListener('drop', (e)=>{
    const dt = e.dataTransfer;
    if (!dt) return;
    const files = Array.from(dt.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
  });

  uploadArea.addEventListener('click', ()=> fileInput.click());
  uploadArea.addEventListener('keypress', (e)=>{ if(e.key === 'Enter') fileInput.click(); });

  fileInput.addEventListener('change', (e)=>{
    const files = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
    handleFiles(files);
    fileInput.value = '';
  });

  // store images in-memory (and sessionStorage for navigation demo)
  let uploaded = JSON.parse(sessionStorage.getItem('uploadedImages') || '[]');

  function handleFiles(files){
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = evt => {
        const src = evt.target.result;
        uploaded.push({name: file.name, src});
        renderThumb({name: file.name, src});
        sessionStorage.setItem('uploadedImages', JSON.stringify(uploaded));
      };
      reader.readAsDataURL(file);
    });
  }

  function renderThumb(item){
    const el = document.createElement('div'); el.className = 'thumb';
    const img = document.createElement('img'); img.src = item.src; img.alt = item.name;
    const name = document.createElement('div'); name.className = 'name'; name.textContent = item.name;
    el.appendChild(img); el.appendChild(name);
    gallery.appendChild(el);
  }

  // Render any previously uploaded items
  if (uploaded.length) uploaded.forEach(renderThumb);

  createBtn.addEventListener('click', ()=>{
    // In a real app, you'd send images to backend or run local OCR/ML.
    // For now, persist to sessionStorage and navigate to recipe page to demo flow.
    sessionStorage.setItem('uploadedImages', JSON.stringify(uploaded));

    // Update a simple weekly history in localStorage for the Analysis tab.
    try {
      const key = 'nutrition_history';
      const today = new Date().toISOString().slice(0,10); // YYYY-MM-DD
      const raw = localStorage.getItem(key);
      const hist = raw ? JSON.parse(raw) : {};
      // Use number of uploaded images as a proxy metric for "meals/inputs" for the day
      const delta = Math.max(1, uploaded.length);
      hist[today] = (hist[today] || 0) + delta;
      localStorage.setItem(key, JSON.stringify(hist));
    } catch (err) {
      console.warn('Could not update nutrition history', err);
    }

    // Navigate to recipe page
    window.location.href = 'recipe.html';
  });
});

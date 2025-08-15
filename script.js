    const $ = (sel, root=document) => root.querySelector(sel);
    const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));


    const state = {
      skills: [],
      edu: [],
      exp: []
    };

    function calcProgress(){
      let total = 6; 
      let score = 0;
      if($('#name').value.trim()) score++;
      if($('#email').value.trim()) score++;
      if($('#phone').value.trim()) score++;
      if($('#summary').value.trim()) score++;
      if(state.edu.length>0) score++;
      if(state.exp.length>0 || state.skills.length>0) score++;
      const pct = Math.round((score/total)*100);
      const bar = $('#progressBar');
      const pctEl = $('#progressPct');
      bar.style.width = pct + '%';
      pctEl.textContent = pct + '%';
    }

    function renderSkills(){
      const wrap = $('#rSkills');
      wrap.innerHTML = '';
      if(state.skills.length){
        $('#rSkillsSec').style.display = '';
        state.skills.forEach((sk, idx)=>{
          const chip = document.createElement('span');
          chip.className = 'chip';
          chip.innerHTML = `${sk} <button title="Remove" aria-label="Remove ${sk}" data-idx="${idx}">×</button>`;
          wrap.appendChild(chip);
        });
      }else{
        $('#rSkillsSec').style.display = 'none';
      }
      calcProgress();
    }

    function addSkillFromInput(){
      const inp = $('#skillInput');
      const val = inp.value.trim();
      if(!val) return;
      if(state.skills.includes(val)) { inp.value=''; return; }
      state.skills.push(val);
      // also add chip in input area
      const chip = document.createElement('span');
      chip.className = 'chip';
      chip.innerHTML = `${val} <button title="Remove" aria-label="Remove ${val}">×</button>`;
      chip.querySelector('button').addEventListener('click', ()=>{
        // remove from state
        state.skills = state.skills.filter(s=>s!==val);
        chip.remove();
        renderSkills();
      });
      $('#skillInputWrap').insertBefore(chip, $('#skillInput'));
      inp.value='';
      renderSkills();
    }

    function addEduBlock(data={}){
      const tpl = $('#tplEdu').content.cloneNode(true);
      const block = tpl.querySelector('.edu-block');
      $('#eduList').appendChild(tpl);
      // populate
      const inputs = $$('input', block);
      inputs.find(i=>i.name==='institution').value = data.institution||'';
      inputs.find(i=>i.name==='degree').value = data.degree||'';
      inputs.find(i=>i.name==='years').value = data.years||'';
      inputs.find(i=>i.name==='score').value = data.score||'';

      block.querySelector('.btn-del').addEventListener('click', ()=>{
        block.remove();
        syncEduState();
      });

      inputs.forEach(inp=> inp.addEventListener('input', syncEduState));

      syncEduState();
    }

    function syncEduState(){
      const blocks = $$('#eduList .edu-block');
      state.edu = blocks.map(b=>{
        return {
          institution: $('input[name="institution"]', b).value.trim(),
          degree: $('input[name="degree"]', b).value.trim(),
          years: $('input[name="years"]', b).value.trim(),
          score: $('input[name="score"]', b).value.trim(),
        }
      }).filter(item=> item.institution || item.degree || item.years || item.score);
      renderEdu();
    }

    function renderEdu(){
      const sec = $('#rEduSec');
      const wrap = $('#rEdu');
      wrap.innerHTML = '';
      if(!state.edu.length){ sec.style.display='none'; calcProgress(); return; }
      sec.style.display='';
      state.edu.forEach(ed=>{
        const div = document.createElement('div');
        div.className = 'edu-item';
        div.innerHTML = `
          <div class="title">${ed.degree || ''}</div>
          <div class="meta">${ed.institution || ''}${ed.institution && ed.years ? ' • ' : ''}${ed.years || ''}${ed.score ? ` • ${ed.score}`: ''}</div>
        `;
        wrap.appendChild(div);
      });
      calcProgress();
    }

    function addExpBlock(data={}){
      const tpl = $('#tplExp').content.cloneNode(true);
      const block = tpl.querySelector('.exp-block');
      $('#expList').appendChild(tpl);

      const company = $('input[name="company"]', block);
      const role = $('input[name="role"]', block);
      const dur = $('input[name="duration"]', block);
      const loc = $('input[name="location"]', block);
      const hi = $('textarea[name="highlights"]', block);
      company.value = data.company||'';
      role.value = data.role||'';
      dur.value = data.duration||'';
      loc.value = data.location||'';
      hi.value = (data.highlights||[]).join('\n');

      $$('input, textarea', block).forEach(el=> el.addEventListener('input', syncExpState));
      block.querySelector('.btn-del').addEventListener('click', ()=>{ block.remove(); syncExpState(); });

      syncExpState();
    }

    function syncExpState(){
      const blocks = $$('#expList .exp-block');
      state.exp = blocks.map(b=>({
        company: $('input[name="company"]', b).value.trim(),
        role: $('input[name="role"]', b).value.trim(),
        duration: $('input[name="duration"]', b).value.trim(),
        location: $('input[name="location"]', b).value.trim(),
        highlights: $('textarea[name="highlights"]', b).value.split('\n').map(l=>l.trim()).filter(Boolean)
      })).filter(item=> item.company || item.role || item.duration || item.location || item.highlights.length);
      renderExp();
    }

    function renderExp(){
      const sec = $('#rExpSec');
      const wrap = $('#rExp');
      wrap.innerHTML = '';
      if(!state.exp.length){ sec.style.display='none'; calcProgress(); return; }
      sec.style.display='';
      state.exp.forEach(ex=>{
        const div = document.createElement('div');
        div.className = 'exp-item';
        const locPart = ex.location ? ` • ${ex.location}` : '';
        div.innerHTML = `
          <div class="title">${ex.role || ''}</div>
          <div class="meta">${ex.company || ''}${ex.company && (ex.duration||ex.location)?' • ':''}${ex.duration || ''}${locPart}</div>
        `;
        if(ex.highlights.length){
          const ul = document.createElement('ul'); ul.className='bullets';
          ex.highlights.forEach(h=>{ const li=document.createElement('li'); li.textContent=h; ul.appendChild(li); });
          div.appendChild(ul);
        }
        wrap.appendChild(div);
      });
      calcProgress();
    }

    function bindIdentity(){
      const name = $('#name');
      const email = $('#email');
      const phone = $('#phone');
      const summary = $('#summary');
      const update = ()=>{
        $('#rName').textContent = name.value.trim() || 'Your Name';
        const e = email.value.trim() || 'email@example.com';
        $('#rEmail').textContent = e; $('#rEmail').href = e ? `mailto:${e}` : '#';
        $('#rPhone').textContent = phone.value.trim() || '+91 00000 00000';
        const s = summary.value.trim();
        $('#rSummarySec').style.display = s ? '' : 'none';
        $('#rSummary').textContent = s;
        calcProgress();
      };
      [name, email, phone, summary].forEach(el=> el.addEventListener('input', update));
      update();
    }

    function bindEvents(){
      addEduBlock();
      addExpBlock();

      $('#addEdu').addEventListener('click', ()=> addEduBlock());
      $('#addExp').addEventListener('click', ()=> addExpBlock());

      $('#skillInput').addEventListener('keydown', (e)=>{
        if(e.key==='Enter'){
          e.preventDefault();
          addSkillFromInput();
        }
      });

      $('#rSkills').addEventListener('click', (e)=>{
        if(e.target.tagName==='BUTTON'){
          const idx = Number(e.target.dataset.idx);
          if(Number.isInteger(idx)){
            state.skills.splice(idx,1);
            const chips = $$('#skillInputWrap .chip');
            if(chips[idx]) chips[idx].remove();
            renderSkills();
          }
        }
      });

      $('#btnClear').addEventListener('click', ()=>{
        if(!confirm('Clear the entire form and preview?')) return;
        $('#resumeForm').reset();
        $('#eduList').innerHTML = '';
        $('#expList').innerHTML = '';
        addEduBlock();
        addExpBlock();
        state.skills = [];
        $$('#skillInputWrap .chip').forEach(c=>c.remove());
        renderSkills();
        bindIdentity();
        calcProgress();
        window.scrollTo({top:0, behavior:'smooth'});
      });


      $('#btnPrint').addEventListener('click', ()=>{
        
        window.print();
      });
    }


    document.addEventListener('DOMContentLoaded', ()=>{
      bindIdentity();
      bindEvents();
      calcProgress();
    });
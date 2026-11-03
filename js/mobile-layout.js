/* Menu hotfix: UI state only; no account or learning storage access. */
const app=document.querySelector('#app'),nav=document.querySelector('#navigator');
const mobile=matchMedia('(max-width:900px)');
const ids=['navigator','settings','bag','dialogue','panel'];
const toggle=document.querySelector('#list-toggle'),closeButton=document.querySelector('#list-close');
const toggleHome=document.createComment('navigation toggle home');toggle.before(toggleHome);
const shade=document.createElement('button');shade.id='mobile-modal-shade';shade.type='button';shade.hidden=true;shade.setAttribute('aria-label','關閉目前面板');app.append(shade);
const toolsSlot=document.createElement('div');toolsSlot.id='nav-account-tools-slot';nav.append(toolsSlot);
let toolsHome=null,active=null,returnFocus=null,frame=0,sequence=0;
const order=new Map(),inertBefore=new Map(),modalBefore=new Map();
const visible=e=>!!e&&!e.hidden&&getComputedStyle(e).display!=='none';
function restore(){for(const [e,v] of inertBefore)e.inert=v;inertBefore.clear();for(const [e,attrs] of modalBefore)for(const [name,value] of Object.entries(attrs)){if(value===null)e.removeAttribute(name);else e.setAttribute(name,value);}modalBefore.clear();}
function hide(e){if(!e||e.hidden)return;if(e.id==='panel'){document.querySelector('#panel-close')?.click();if(!e.hidden)e.hidden=true;document.body.classList.remove('panel-open');}else if(e.id==='dialogue'){e.querySelector('#talk-close,#animal-close')?.click();if(!e.hidden)e.hidden=true;document.body.classList.remove('npc-open');}else e.hidden=true;}
function arrange(){if(mobile.matches&&visible(nav)){const row=nav.querySelector('.row');if(toggle.parentElement!==row)row.insertBefore(toggle,closeButton);}else if(toggleHome.parentNode&&toggle.previousSibling!==toggleHome)toggleHome.after(toggle);
 const tools=document.querySelector('#account-tools');if(tools){if(!toolsHome){toolsHome=document.createComment('account tools home');tools.before(toolsHome);}if(mobile.matches){if(tools.parentElement!==toolsSlot)toolsSlot.append(tools);}else if(toolsHome.parentNode&&tools.previousSibling!==toolsHome)toolsHome.after(tools);}
 const text=mobile.matches&&visible(nav)?'☷ 收合導覽':'☷ 島嶼導覽';if(toggle.textContent!==text)toggle.textContent=text;
 if(closeButton.textContent!=='× 關閉')closeButton.textContent='× 關閉';
}
function sync(){frame=0;arrange();const portal=document.querySelector('#portal');const shown=mobile.matches&&visible(app)&&!visible(portal)?ids.map(id=>document.getElementById(id)).filter(visible):[];const next=shown.sort((a,b)=>(order.get(a)||0)-(order.get(b)||0)).at(-1)||null;
 if(next!==active){const had=active;restore();active=next;if(next){if(!had)returnFocus=document.activeElement;for(const child of app.children)if(child!==next&&child!==shade){inertBefore.set(child,child.inert);child.inert=true;}next.inert=false;const attrs={};for(const name of ['role','aria-modal','tabindex'])attrs[name]=next.getAttribute(name);modalBefore.set(next,attrs);next.setAttribute('role','dialog');next.setAttribute('aria-modal','true');next.setAttribute('tabindex','-1');queueMicrotask(()=>{if(active===next&&!next.contains(document.activeElement))(next.querySelector('button:not([disabled]),input:not([disabled])')||next).focus({preventScroll:true});});}else{if(returnFocus?.isConnected&&visible(returnFocus)&&!returnFocus.closest('[inert]'))returnFocus.focus({preventScroll:true});returnFocus=null;}}
 document.body.classList.toggle('mobile-modal-open',!!next);if(shade.hidden!==!next)shade.hidden=!next;toggle.setAttribute('aria-expanded',String(visible(nav)));toggle.setAttribute('aria-controls','navigator');
}
function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
function closeNav(){nav.hidden=true;sync();}
function toggleNav(){if(visible(nav)){closeNav();return;}for(const id of ids)if(id!=='navigator')hide(document.getElementById(id));nav.hidden=false;order.set(nav,++sequence);sync();}
document.addEventListener('click',e=>{if(!mobile.matches)return;const button=e.target.closest('button');if(!button)return;
 if(button===toggle||button===closeButton||button===shade||button.matches('[data-mobile-close]')){e.preventDefault();e.stopImmediatePropagation();if(button===toggle)toggleNav();else if(button===closeButton)closeNav();else {hide(button===shade?active:document.getElementById(button.dataset.mobileClose));sync();}return;}
 if(button.matches('#island-password-settings,#rewatch-guide,#course-return')){closeNav();return;}
 if(nav.contains(button)&&button.closest('[data-island]')){closeNav();return;}
},true);
for(const id of ['settings','bag']){const el=document.getElementById(id);const b=document.createElement('button');b.type='button';b.dataset.mobileClose=id;b.id='mobile-close-'+id;b.className='mobile-overlay-close';b.textContent='× 關閉';b.setAttribute('aria-label',id==='settings'?'關閉設定':'關閉背包');el.prepend(b);}
document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();hide(active);sync();return;}if(e.key==='Tab'){const list=[...active.querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex="0"]')].filter(e=>e.getClientRects().length&&!e.closest('[inert]'));if(!list.length){e.preventDefault();active.focus();return;}const first=list[0],last=list.at(-1);if(e.shiftKey&&(document.activeElement===first||!active.contains(document.activeElement))){e.preventDefault();last.focus();}else if(!e.shiftKey&&(document.activeElement===last||!active.contains(document.activeElement))){e.preventDefault();first.focus();}}},true);
new MutationObserver(records=>{for(const r of records)if(r.type==='attributes'&&ids.includes(r.target.id)&&!r.target.hidden)order.set(r.target,++sequence);schedule();}).observe(app,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
new MutationObserver(schedule).observe(document.querySelector('#portal'),{attributes:true,attributeFilter:['hidden']});
mobile.addEventListener('change',sync);sync();

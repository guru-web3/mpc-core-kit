var ne=Object.defineProperty;var oe=(e,t,o)=>t in e?ne(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o;var v=(e,t,o)=>oe(e,typeof t!="symbol"?t+"":t,o);import{O as se,P as C,Q as re,R as A,U as ie,V as ce,W as ae}from"./index-DX4e5JdD.js";function ue(e){return!!(e&&typeof e.then=="function")}Promise.resolve(!1);Promise.resolve(!0);const p=Promise.resolve();function S(e,t){return e||(e=0),new Promise(o=>setTimeout(()=>o(t),e))}function de(e,t){return Math.floor(Math.random()*(t-e+1)+e)}function _(){return Math.random().toString(36).substring(2)}let M=0;function m(){let e=Date.now()*1e3;return e<=M&&(e=M+1),M=e,e}const d=se.getLogger("broadcast-channel");d.setLevel("error");const le=m,fe="native";function me(e){const t={time:m(),messagesCallback:null,bc:new BroadcastChannel(e),subFns:[]};return t.bc.onmessage=o=>{t.messagesCallback&&t.messagesCallback(o.data)},t}function ge(e){e.bc.close(),e.subFns=[]}function pe(e,t){try{return e.bc.postMessage(t,!1),p}catch(o){return Promise.reject(o)}}function he(e,t){e.messagesCallback=t}function be(){if(typeof window>"u")return!1;if(typeof BroadcastChannel=="function"){if(BroadcastChannel._pubkey)throw new Error("BroadcastChannel: Do not overwrite window.BroadcastChannel with this module, this is not a polyfill");return!0}else return!1}function ye(){return 150}const _e=Object.freeze(Object.defineProperty({__proto__:null,averageResponseTime:ye,canBeUsed:be,close:ge,create:me,microSeconds:le,onMessage:he,postMessage:pe,type:fe},Symbol.toStringTag,{value:"Module"}));class P{constructor(t){v(this,"ttl");v(this,"map",new Map);v(this,"_to",!1);this.ttl=t}has(t){return this.map.has(t)}add(t){this.map.set(t,U()),this._to||(this._to=!0,setTimeout(()=>{this._to=!1,we(this)},0))}clear(){this.map.clear()}}function we(e){const t=U()-e.ttl,o=e.map[Symbol.iterator]();for(;;){const n=o.next().value;if(!n)return;const s=n[0];if(n[1]<t)e.map.delete(s);else return}}function U(){return Date.now()}function k(e={}){const t=JSON.parse(JSON.stringify(e));return typeof t.webWorkerSupport>"u"&&(t.webWorkerSupport=!0),t.idb||(t.idb={}),t.idb.ttl||(t.idb.ttl=1e3*45),t.idb.fallbackInterval||(t.idb.fallbackInterval=150),e.idb&&typeof e.idb.onclose=="function"&&(t.idb.onclose=e.idb.onclose),t.localstorage||(t.localstorage={}),t.localstorage.removeTimeout||(t.localstorage.removeTimeout=1e3*60),t.server||(t.server={}),t.server.url||(t.server.url="https://session.web3auth.io"),t.server.removeTimeout||(t.server.removeTimeout=1e3*60*5),e.methods&&(t.methods=e.methods),t}const ve=m,ke="pubkey.broadcast-channel-0-",l="messages",h={durability:"relaxed"},Me="idb";function E(){if(typeof indexedDB<"u")return indexedDB;if(typeof window<"u"){if(typeof window.mozIndexedDB<"u")return window.mozIndexedDB;if(typeof window.webkitIndexedDB<"u")return window.webkitIndexedDB;if(typeof window.msIndexedDB<"u")return window.msIndexedDB}return!1}function w(e){e.commit&&e.commit()}function K(e){const t=E(),o=ke+e,n=t.open(o);return n.onupgradeneeded=r=>{r.target.result.createObjectStore(l,{keyPath:"id",autoIncrement:!0})},new Promise((r,i)=>{n.onerror=c=>i(c),n.onsuccess=()=>{r(n.result)}})}function j(e,t,o){const n=Date.now(),s={uuid:t,time:n,data:o},r=e.transaction([l],"readwrite",h);return new Promise((i,c)=>{r.oncomplete=()=>i(),r.onerror=u=>c(u),r.objectStore(l).add(s),w(r)})}function Ce(e){const t=e.transaction(l,"readonly",h),o=t.objectStore(l),n=[];return new Promise(s=>{o.openCursor().onsuccess=r=>{const i=r.target.result;i?(n.push(i.value),i.continue()):(w(t),s(n))}})}function z(e,t){const o=e.transaction(l,"readonly",h),n=o.objectStore(l),s=[];let r=IDBKeyRange.bound(t+1,1/0);if(n.getAll){const c=n.getAll(r);return new Promise((a,u)=>{c.onerror=g=>u(g),c.onsuccess=function(g){a(g.target.result)}})}function i(){try{return r=IDBKeyRange.bound(t+1,1/0),n.openCursor(r)}catch{return n.openCursor()}}return new Promise((c,a)=>{const u=i();u.onerror=g=>a(g),u.onsuccess=g=>{const f=g.target.result;f?f.value.id<t+1?f.continue(t+1):(s.push(f.value),f.continue()):(w(o),c(s))}})}function F(e,t){const n=e.transaction([l],"readwrite",h).objectStore(l);return Promise.all(t.map(s=>{const r=n.delete(s);return new Promise(i=>{r.onsuccess=()=>i()})}))}function J(e,t){const o=Date.now()-t,n=e.transaction(l,"readonly",h),s=n.objectStore(l),r=[];return new Promise(i=>{s.openCursor().onsuccess=c=>{const a=c.target.result;if(a){const u=a.value;if(u.time<o)r.push(u),a.continue();else{w(n),i(r);return}}else i(r)}})}function V(e,t){return J(e,t).then(o=>F(e,o.map(n=>n.id)))}function Se(e,t){return t=k(t),K(e).then(o=>{const n={closed:!1,lastCursorId:0,channelName:e,options:t,uuid:_(),eMIs:new P(t.idb.ttl*2),writeBlockPromise:p,messagesCallback:null,readQueuePromises:[],db:o,time:m()};return o.onclose=function(){n.closed=!0,t.idb.onclose&&t.idb.onclose()},W(n),n})}function W(e){e.closed||q(e).then(()=>S(e.options.idb.fallbackInterval)).then(()=>W(e))}function Pe(e,t){return!(e.uuid===t.uuid||t.eMIs.has(e.id)||e.data.time<t.messagesCallbackTime)}function q(e){return e.closed||!e.messagesCallback?p:z(e.db,e.lastCursorId).then(t=>(t.filter(n=>!!n).map(n=>(n.id>e.lastCursorId&&(e.lastCursorId=n.id),n)).filter(n=>Pe(n,e)).sort((n,s)=>n.time-s.time).forEach(n=>{e.messagesCallback&&(e.eMIs.add(n.id),e.messagesCallback(n.data))}),p))}function Ee(e){e.closed=!0,e.db.close()}function Te(e,t){return e.writeBlockPromise=e.writeBlockPromise.then(()=>j(e.db,e.uuid,t)).then(()=>{de(0,10)===0&&V(e.db,e.options.idb.ttl)}),e.writeBlockPromise}function Ie(e,t,o){e.messagesCallbackTime=o,e.messagesCallback=t,q(e)}function Le(){return!!E()}function Be(e){return e.idb.fallbackInterval*2}const $e=Object.freeze(Object.defineProperty({__proto__:null,TRANSACTION_SETTINGS:h,averageResponseTime:Be,canBeUsed:Le,cleanOldMessages:V,close:Ee,commitIndexedDBTransaction:w,create:Se,createDatabase:K,getAllMessages:Ce,getIdb:E,getMessagesHigherThan:z,getOldMessages:J,microSeconds:ve,onMessage:Ie,postMessage:Te,removeMessagesById:F,type:Me,writeMessage:j},Symbol.toStringTag,{value:"Module"})),De=m,Ne="pubkey.broadcastChannel-",xe="localstorage";function T(){let e;if(typeof window>"u")return null;try{e=window.localStorage,e=window["ie8-eventlistener/storage"]||window.localStorage}catch{}return e}function I(e){return Ne+e}function Oe(e,t){return new Promise(o=>{S().then(()=>{const n=I(e.channelName),s={token:_(),time:Date.now(),data:t,uuid:e.uuid},r=JSON.stringify(s);T().setItem(n,r);const i=document.createEvent("Event");i.initEvent("storage",!0,!0),i.key=n,i.newValue=r,window.dispatchEvent(i),o()})})}function H(e,t){const o=I(e),n=s=>{s.key===o&&t(JSON.parse(s.newValue))};return window.addEventListener("storage",n),n}function X(e){window.removeEventListener("storage",e)}function Re(e,t){if(t=k(t),!Y())throw new Error("BroadcastChannel: localstorage cannot be used");const o=_(),n=new P(t.localstorage.removeTimeout),s={channelName:e,uuid:o,time:m(),eMIs:n};return s.listener=H(e,r=>{s.messagesCallback&&r.uuid!==o&&(!r.token||n.has(r.token)||r.data.time&&r.data.time<s.messagesCallbackTime||(n.add(r.token),s.messagesCallback(r.data)))}),s}function Ae(e){X(e.listener)}function Ue(e,t,o){e.messagesCallbackTime=o,e.messagesCallback=t}function Y(){const e=T();if(!e)return!1;try{const t="__broadcastchannel_check";e.setItem(t,"works"),e.removeItem(t)}catch{return!1}return!0}function Ke(){const t=navigator.userAgent.toLowerCase();return t.includes("safari")&&!t.includes("chrome")?120*2:120}const je=Object.freeze(Object.defineProperty({__proto__:null,addStorageEventListener:H,averageResponseTime:Ke,canBeUsed:Y,close:Ae,create:Re,getLocalStorage:T,microSeconds:De,onMessage:Ue,postMessage:Oe,removeStorageEventListener:X,storageKey:I,type:xe},Symbol.toStringTag,{value:"Module"})),ze=m,Fe="pubkey.broadcastChannel-",Je="server";let b=null;const y=new Set;function L(e){return Fe+e}function Ve(e,t){return new Promise((o,n)=>{S().then(async()=>{const s=L(e.channelName),r=C(Buffer.from(s,"utf8")),i=await re(r.toString("hex"),{token:_(),time:Date.now(),data:t,uuid:e.uuid}),c={sameOriginCheck:!0,sameIpCheck:!0,key:A(r).toString("hex"),data:i,signature:(await ie(r,C(Buffer.from(i,"utf8")))).toString("hex")};return e.timeout&&(c.timeout=e.timeout),fetch(e.serverUrl+"/channel/set",{method:"POST",body:JSON.stringify(c),headers:{"Content-Type":"application/json; charset=utf-8"}}).then(o).catch(n)})})}function Q(e){if(b)return b;const t=ce(e,{transports:["websocket","polling"],withCredentials:!0,reconnectionDelayMax:1e4,reconnectionAttempts:10});return t.on("connect_error",o=>{t.io.opts.transports=["polling","websocket"],d.error("connect error",o)}),t.on("connect",async()=>{const{engine:o}=t.io;d.debug("initially connected to",o.transport.name),o.once("upgrade",()=>{d.debug("upgraded",o.transport.name)}),o.once("close",n=>{d.debug("connection closed",n)})}),t.on("error",o=>{d.error("socket errored",o),t.disconnect()}),b=t,t}function G(e,t,o){const n=Q(e),s=L(t.channelName),r=C(Buffer.from(s,"utf8")),i=A(r).toString("hex");n.connected?n.emit("check_auth_status",i,{sameOriginCheck:!0,sameIpCheck:!0}):n.once("connect",()=>{d.debug("connected with socket"),n.emit("check_auth_status",i,{sameOriginCheck:!0,sameIpCheck:!0})});const c=()=>{n.once("connect",async()=>{y.has(t.channelName)&&n.emit("check_auth_status",i,{sameOriginCheck:!0,sameIpCheck:!0})})},a=()=>{if(!n||!y.has(t.channelName)){document.removeEventListener("visibilitychange",a);return}!n.connected&&document.visibilityState==="visible"&&c()},u=async g=>{try{const f=await ae(r.toString("hex"),g);d.info(f),o(f)}catch(f){d.error(f)}};return n.on("disconnect",()=>{d.debug("socket disconnected"),y.has(t.channelName)&&(d.error("socket disconnected unexpectedly, reconnecting socket"),c())}),n.on(`${i}_success`,u),typeof document<"u"&&document.addEventListener("visibilitychange",a),n}function We(){b&&b.disconnect()}function qe(e,t){t=k(t);const o=_(),n=new P(t.server.removeTimeout),s={channelName:e,uuid:o,eMIs:n,serverUrl:t.server.url,time:m()};return t.server.timeout&&(s.timeout=t.server.timeout),G(t.server.url,s,r=>{s.messagesCallback&&r.uuid!==s.uuid&&(!r.token||s.eMIs.has(r.token)||(s.eMIs.add(r.token),s.messagesCallback(r.data)))}),y.add(e),s}function He(e){y.delete(e.channelName)}function Xe(e,t,o){e.messagesCallbackTime=o,e.messagesCallback=t}function Ye(){return!0}function Qe(){return 500}const Ge=Object.freeze(Object.defineProperty({__proto__:null,averageResponseTime:Qe,canBeUsed:Ye,close:He,create:qe,getSocketInstance:Q,microSeconds:ze,onMessage:Xe,postMessage:Ve,removeStorageEventListener:We,setupSocketConnection:G,storageKey:L,type:Je},Symbol.toStringTag,{value:"Module"})),Ze=m,et="simulate",B=new Set,$=5;function tt(e){const t={time:m(),name:e,messagesCallback:null};return B.add(t),t}function nt(e){B.delete(e)}function ot(e,t){return new Promise(o=>setTimeout(()=>{Array.from(B).forEach(s=>{s.name===e.name&&s!==e&&s.messagesCallback&&s.time<t.time&&s.messagesCallback(t)}),o()},$))}function st(e,t){e.messagesCallback=t}function rt(){return!0}function it(){return $}const ct=Object.freeze(Object.defineProperty({__proto__:null,SIMULATE_DELAY_TIME:$,averageResponseTime:it,canBeUsed:rt,close:nt,create:tt,microSeconds:Ze,onMessage:st,postMessage:ot,type:et},Symbol.toStringTag,{value:"Module"})),D=[_e,$e,je,Ge];function at(e){let t=[].concat(e.methods,D).filter(Boolean);if(e.type){if(e.type==="simulate")return ct;const n=t.find(s=>s.type===e.type);if(n)return n;throw new Error("method-type "+e.type+" not found")}e.webWorkerSupport||(t=t.filter(n=>n.type!=="idb"));const o=t.find(n=>n.canBeUsed(e));if(o)return o;throw new Error(`No useable method found in ${JSON.stringify(D.map(n=>n.type))}`)}const Z=new Set;let ut=0;const ee=function(e,t){this.id=ut++,Z.add(this),this.name=e,N&&(t=N),this.options=k(t),this.method=at(this.options),this._iL=!1,this._onML=null,this._addEL={message:[],internal:[]},this._uMP=new Set,this._befC=[],this._prepP=null,dt(this)};ee._pubkey=!0;let N;ee.prototype={postMessage(e){if(this.closed)throw new Error("BroadcastChannel.postMessage(): Cannot post message after channel has closed "+JSON.stringify(e));return x(this,"message",e)},postInternal(e){return x(this,"internal",e)},set onmessage(e){const o={time:this.method.microSeconds(),fn:e};R(this,"message",this._onML),e&&typeof e=="function"?(this._onML=o,O(this,"message",o)):this._onML=null},addEventListener(e,t){const n={time:this.method.microSeconds(),fn:t};O(this,e,n)},removeEventListener(e,t){const o=this._addEL[e].find(n=>n.fn===t);R(this,e,o)},close(){if(this.closed)return;Z.delete(this),this.closed=!0;const e=this._prepP?this._prepP:p;return this._onML=null,this._addEL.message=[],e.then(()=>Promise.all(Array.from(this._uMP))).then(()=>Promise.all(this._befC.map(t=>t()))).then(()=>this.method.close(this._state))},get type(){return this.method.type},get isClosed(){return this.closed}};function x(e,t,o){const s={time:e.method.microSeconds(),type:t,data:o};return(e._prepP?e._prepP:p).then(()=>{const i=e.method.postMessage(e._state,s);return e._uMP.add(i),i.catch().then(()=>e._uMP.delete(i)),i})}function dt(e){const t=e.method.create(e.name,e.options);ue(t)?(e._prepP=t,t.then(o=>{e._state=o})):e._state=t}function te(e){return e._addEL.message.length>0||e._addEL.internal.length>0}function O(e,t,o){e._addEL[t].push(o),lt(e)}function R(e,t,o){e._addEL[t]=e._addEL[t].filter(n=>n!==o),ft(e)}function lt(e){if(!e._iL&&te(e)){const t=n=>{e._addEL[n.type].forEach(s=>{(n.time>=s.time||e.method.type==="server")&&s.fn(n.data)})},o=e.method.microSeconds();e._prepP?e._prepP.then(()=>{e._iL=!0,e.method.onMessage(e._state,t,o)}):(e._iL=!0,e.method.onMessage(e._state,t,o))}}function ft(e){if(e._iL&&!te(e)){e._iL=!1;const t=e.method.microSeconds();e.method.onMessage(e._state,null,t)}}export{ee as BroadcastChannel,$e as IndexedDbMethod,je as LocalstorageMethod,_e as NativeMethod,Z as OPEN_BROADCAST_CHANNELS,Ge as ServerMethod,at as chooseMethod};

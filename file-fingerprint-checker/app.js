'use strict';
const Get=Id=>document.getElementById(Id);
const File=Get('file'),Reference=Get('reference'),Calculate=Get('calculate'),Cancel=Get('cancel'),Result=Get('result');
let Job=null,Generation=0,Timeout=null;
function Stop(){clearTimeout(Timeout);Timeout=null;Generation++;if(Job)Job.terminate();Job=null;Calculate.disabled=false;Cancel.hidden=true;}
function Hide(){Result.hidden=true;for(const Id of ['name','bytes','hash','outcome','compared'])Get(Id).textContent='';Get('error').textContent='';Get('status').textContent='';}
function Invalidate(){Stop();Hide();}
File.addEventListener('change',Invalidate);Reference.addEventListener('input',Invalidate);
Get('clear').addEventListener('click',()=>{Invalidate();File.value='';Reference.value='';Get('status').textContent='Cleared. No result is kept in this page.';File.focus();});
Cancel.addEventListener('click',()=>{Stop();Hide();Get('status').textContent='Calculation cancelled. No result was kept.';Calculate.focus();});
Calculate.addEventListener('click',()=>{
 Invalidate();const Chosen=File.files[0],Expected=Reference.value.trim();
 if(!Chosen){Get('error').textContent='Choose a file first.';File.focus();return;}
 if(Chosen.size>16777216){Get('error').textContent='This file exceeds 16 MiB (16,777,216 bytes). Choose a smaller file or use the Python guide.';File.focus();return;}
 if(Expected&&!/^[0-9a-fA-F]{64}$/.test(Expected)){Get('error').textContent='The reference must contain exactly 64 hexadecimal characters (0-9 and a-f), with no spaces inside.';Reference.focus();return;}
 if(!window.Worker||!window.crypto?.subtle){Get('error').textContent='This browser cannot run the local calculation here. Use a supported browser on HTTPS, or the Python guide.';return;}
 const Current=Generation;Calculate.disabled=true;Cancel.hidden=false;Get('status').textContent='Reading and calculating on this device. Nothing is uploaded.';
 try{Job=new Worker('worker.js');}catch(Error){Stop();Get('status').textContent='';Get('error').textContent='The background calculation could not start. No result was produced.';return;}
 Job.onerror=()=>{if(Current!==Generation)return;Stop();Get('status').textContent='';Get('error').textContent='The background calculation failed. No result was produced.';};
 Job.onmessage=({data})=>{
  if(Current!==Generation)return;Stop();Get('status').textContent='';
  if(data.error){Get('error').textContent=data.error;return;}
  if(!/^[0-9a-f]{64}$/.test(data.hash)||data.bytes!==Chosen.size){Get('error').textContent='The calculation did not return a complete result.';return;}
  Get('name').textContent=Chosen.name;Get('bytes').textContent=data.bytes.toLocaleString('en-GB');Get('hash').textContent=data.hash;Get('compared').textContent=Expected?Expected.toLowerCase():'No reference compared';
  Get('outcome').textContent=Expected?(Expected.toLowerCase()===data.hash?'Matches your reference. This is not proof that the file is safe.':'Does not match your reference. Check the file, reference and intended version.'):'Fingerprint calculated. No reference was compared.';
  Result.hidden=false;Get('result-title').focus();
 };
 Timeout=setTimeout(()=>{if(Current!==Generation)return;Stop();Get('status').textContent='';Get('error').textContent='The calculation took more than 30 seconds and was stopped. No result was kept. Try a smaller file or the Python guide.';},30000);
 try{Job.postMessage({file:Chosen});}catch(Error){Stop();Get('status').textContent='';Get('error').textContent='The file could not be passed to the background calculation. No result was produced.';}
});

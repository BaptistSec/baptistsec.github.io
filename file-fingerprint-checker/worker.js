'use strict';
self.onmessage=async ({data})=>{
 try{
  const File=data.file;
  if(!File || File.size>16777216)throw new Error('File exceeds the 16 MiB limit.');
  if(!self.crypto?.subtle)throw new Error('This browser cannot calculate SHA-256 here. Use a supported browser on HTTPS, or the Python guide.');
  const Buffer=await File.arrayBuffer();
  if(Buffer.byteLength!==File.size)throw new Error('The file could not be read completely. No result was produced.');
  const Digest=await self.crypto.subtle.digest('SHA-256',Buffer);
  self.postMessage({hash:Array.from(new Uint8Array(Digest),Byte=>Byte.toString(16).padStart(2,'0')).join(''),bytes:Buffer.byteLength});
 }catch(Error){self.postMessage({error:Error.message||'The calculation failed. No result was produced.'});}
};

'use strict';importScripts('parser.js');let Table=null;
self.onmessage=async({data})=>{try{
 if(data.file){if(data.file.size>1048576)throw Error('File exceeds 1 MiB (1,048,576 bytes).');const Bytes=await data.file.arrayBuffer();const Text=new TextDecoder('utf-8',{fatal:true}).decode(Bytes);Table=CsvCheck.ParseCsv(Text);self.postMessage({header:Table.header,records:Table.rows.length});}
 else if(data.indices){if(!Table)throw Error('Read a file first.');self.postMessage({report:CsvCheck.Inspect(Table,data.indices)});}
}catch(E){Table=null;self.postMessage({error:E.message||'The check stopped.'});}};

'use strict';
(function(Root){
function ParseCsv(Text){
 const Rows=[];let Row=[],Field='',Mode='start',Line=1,Ended=false;
 function Append(Char){Field+=Char;if(Field.length>65536)throw Error('A field exceeds 65,536 text units.');}
 function EndField(){Row.push(Field);Field='';Mode='start';}
 function EndRow(){EndField();Rows.push({cells:Row,line:Line});Row=[];Ended=true;if(Rows.length>1001)throw Error('More than 1,000 data records.');}
 for(let I=0;I<Text.length;I++){
  const C=Text[I],NL=C==='\r'||C==='\n';Ended=false;
  if(Mode==='quoted'){
   if(C==='"'){if(Text[I+1]==='"'){Append('"');I++;}else Mode='closed';}
   else{Append(C);if(C==='\n'||(C==='\r'&&Text[I+1]!=='\n'))Line++;}
   continue;
  }
  if(Mode==='closed'&&C!==','&&!NL)throw Error('Unexpected text after a closing quote.');
  if(NL){EndRow();if(C==='\r'&&Text[I+1]==='\n')I++;Line++;continue;}
  if(C===','){EndField();continue;}
  if(C==='"'){if(Mode!=='start')throw Error('Quote inside an unquoted field.');Mode='quoted';continue;}
  Append(C);Mode='plain';
 }
 if(Mode==='quoted')throw Error('Unfinished quoted field.');
 if(!Text.length)throw Error('Empty input.');
 if(!Ended)EndRow();
 const Header=Rows.shift().cells;
 if(Header.some(Name=>!Name.trim()))throw Error('Blank header name.');
 if(new Set(Header).size!==Header.length)throw Error('Repeated header name.');
 for(let I=0;I<Rows.length;I++)if(Rows[I].cells.length!==Header.length)throw Error('Record '+(I+1)+' has the wrong field count.');
 return {header:Header,rows:Rows};
}
function Inspect(Table,Indices){
 if(!Indices.length||new Set(Indices).size!==Indices.length||Indices.some(I=>!Number.isInteger(I)||I<0||I>=Table.header.length))throw Error('Choose at least one column, once each.');
 const Warnings=[];Table.rows.forEach((Row,R)=>Indices.forEach(I=>{let V=Row.cells[I];if(!/^[0-9]+$/.test(V))return;let Risks=[];if(V.length>1&&V[0]==='0')Risks.push('Potential leading-zero conversion');if(V.length>15)Risks.push('Potential numeric precision loss');if(Risks.length)Warnings.push({record:R+1,line:Row.line,column:I+1,risks:Risks});}));
 return {records:Table.rows.length,columns:Indices.map(I=>I+1),warnings:Warnings};
}
Root.CsvCheck={ParseCsv,Inspect};if(typeof module!=='undefined')module.exports=Root.CsvCheck;
})(typeof self!=='undefined'?self:globalThis);

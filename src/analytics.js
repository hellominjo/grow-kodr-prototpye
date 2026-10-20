export const places=['교실','복도','급식실','운동장','온라인 학습'];
export const values=['존중','책임','안전'];
export const expectations=[['친구의 말을 끝까지 들어요','작은 목소리로 이야기해요','차례를 지켜 배식받아요','친구와 함께 놀이해요','서로 배려하는 댓글을 써요'],['준비물을 스스로 챙겨요','목적지로 바로 이동해요','먹은 자리를 정리해요','놀이 도구를 정리해요','학습 과제를 마무리해요'],['몸과 물건을 소중히 해요','오른쪽으로 천천히 걸어요','뜨거운 음식에 주의해요','놀이 규칙과 경계를 지켜요','개인정보를 보호해요']];
export function seed(){return Array.from({length:28},(_,i)=>({id:'odr-'+i,date:`2026-10-${String(1+Math.floor(i/2)).padStart(2,'0')}`,time:i%3===0?'10:30':i%3===1?'12:20':'09:10',student:['하늘','나무','바다','새봄'][i%4],place:i<12?'복도':places[i%5],value:i<12?'안전':values[i%3],antecedent:i%2?'모둠 활동 전환':'쉬는 시간 이동',behavior:i<12?'복도에서 빠르게 뛰기':['친구 말 끊기','준비물 미지참','차례 벗어나기'][i%3],guidance:'기대행동을 짧게 설명하고 함께 연습',response:i%2?'다시 시도함':'교사와 함께 연습함'}));}
export function positiveSeed(){return Array.from({length:22},(_,i)=>({id:'pos-'+i,date:`2026-10-${String(1+Math.floor(i/2)).padStart(2,'0')}`,time:'10:30',student:['하늘','나무','바다'][i%3],place:places[i%5],value:values[i%3],behavior:expectations[i%3][i%5]}));}
const day=86400000;
export function analyze(records,positive,start,end,cell=null){
 const days=Math.round((Date.parse(end)-Date.parse(start))/day)+1;
 const priorEnd=new Date(Date.parse(start)-day).toISOString().slice(0,10),priorStart=new Date(Date.parse(start)-days*day).toISOString().slice(0,10);
 const match=r=>!cell||(r.place===cell.place&&r.value===cell.value);
 const current=records.filter(r=>r.date>=start&&r.date<=end&&match(r));
 const previous=records.filter(r=>r.date>=priorStart&&r.date<=priorEnd&&match(r));
 const positives=positive.filter(r=>r.date>=start&&r.date<=end&&match(r));
 const group=(key,labels)=>labels.map(label=>({label,count:current.filter(r=>(key==='time'?(r.time<'10:00'?'등교·1교시':r.time<'12:00'?'오전·쉬는 시간':'점심·오후'):r[key])===label).length}));
 const weekly=Array.from({length:Math.ceil(days/7)},(_,i)=>{const a=new Date(Date.parse(start)+i*7*day).toISOString().slice(0,10),b=new Date(Math.min(Date.parse(end),Date.parse(a)+6*day)).toISOString().slice(0,10);return {label:a.slice(5),count:current.filter(r=>r.date>=a&&r.date<=b).length,positive:positives.filter(r=>r.date>=a&&r.date<=b).length};});
 const patterns=Object.values(current.reduce((a,r)=>{const k=r.place+' · '+r.value+' · '+(r.time<'10:00'?'등교·1교시':r.time<'12:00'?'오전·쉬는 시간':'점심·오후');(a[k]??={label:k,count:0,dates:new Set()}).count++;a[k].dates.add(r.date);return a;},{})).filter(x=>x.count>=3&&x.dates.size>=2).sort((a,b)=>b.count-a.count);
 return {current,previous,positives,priorStart,priorEnd,days,weekly,patterns,locations:group('place',places),values:group('value',values),times:group('time',['등교·1교시','오전·쉬는 시간','점심·오후'])};
}

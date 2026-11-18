'use strict';
// Mettre en valeur uniquement des termes du texte déjà affiché ; jamais de réponse ajoutée.
function highlightText(target,text,terms=[]){
 const node=typeof target==='string'?$(target):target;
 node.replaceChildren();
 if(!text)return;
 const escaped=terms.filter(Boolean).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).sort((a,b)=>b.length-a.length);
 if(!escaped.length){node.textContent=text;return;}
 const regex=new RegExp(escaped.join('|'),'giu');let from=0;
 for(const match of text.matchAll(regex)){
  node.append(document.createTextNode(text.slice(from,match.index)));
  const mark=document.createElement('span');mark.className='pedagogical-key';mark.textContent=match[0];node.append(mark);from=match.index+match[0].length;
 }
 node.append(document.createTextNode(text.slice(from)));
}
const pedagogicalClues={
 sauce:[[['menu des repas de fête'],["pain d’épices","pain d'épices"],['défense des animaux']],[['pur beurre'],['deux barres'],['nord de la Garonne']],[['produit de la mer'],['coquille'],['crue']]],
 france:[[['froid'],['charcuterie'],['fermenté']],[['replie'],['salée'],['blé noir']],[['riz'],['tomates'],['île française']]],
 passport:[[['institutions'],['frontière'],['chocolat']],[['explorateurs'],['Atlantique'],['capitale']],[['Carpates'],['régions'],['très, très saignante']]]
};

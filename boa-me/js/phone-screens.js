// Simplified drawings of Mum's phone, one per guide step.
// hl() draws the yellow "Mia ha" (press here) ring; tapping inside it advances the guide.
function hl(x,y,w,h){
  var px=Math.min(Math.max(x+w/2-34,2),186);
  var py=y>70?y-32:y+h+6;
  return '<rect class="ring" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="10" fill="none" stroke="#FFD11A" stroke-width="6"/>'+
  '<rect x="'+px+'" y="'+py+'" width="68" height="26" rx="13" fill="#FFD11A"/>'+
  '<text x="'+(px+34)+'" y="'+(py+18)+'" text-anchor="middle" font-size="14" font-weight="700" fill="#4a3b1c" font-family="Nunito Sans,Arial,sans-serif">Mia ha</text>'+'<rect data-act="next" x="'+(x-8)+'" y="'+(y-8)+'" width="'+(w+16)+'" height="'+(h+16)+'" fill="#000" fill-opacity="0" style="cursor:pointer"><title>Mia ha</title></rect>';
}
function phone(inner){
  return '<svg class="phone" viewBox="0 0 256 440" role="img" aria-label="Fon mfonini / phone picture" font-family="Nunito Sans,Arial,sans-serif">'+
  '<rect x="236" y="120" width="10" height="50" rx="3" fill="#3a4556"/><rect x="236" y="190" width="10" height="70" rx="3" fill="#3a4556"/>'+
  '<rect x="4" y="4" width="236" height="432" rx="30" fill="#2a3440"/><rect x="14" y="16" width="216" height="408" rx="20" fill="#ffffff"/>'+inner+'</svg>';
}
function homeScreen(){
  var s='';
  for(var r=0;r<4;r++)for(var c=0;c<4;c++){
    var x=30+c*50,y=60+r*70;
    if(r===2&&c===1){s+='<rect x="'+x+'" y="'+y+'" width="36" height="36" rx="9" fill="#25D366"/><circle cx="'+(x+18)+'" cy="'+(y+18)+'" r="9" fill="none" stroke="#fff" stroke-width="3"/><text x="'+(x+18)+'" y="'+(y+52)+'" text-anchor="middle" font-size="10" fill="#222">WhatsApp</text>';}
    else if(r===1&&c===3){s+='<rect x="'+x+'" y="'+y+'" width="36" height="36" rx="9" fill="#111820"/><path d="M'+(x+20)+' '+(y+8)+' v16 a5 5 0 1 1 -5 -5" fill="none" stroke="#fff" stroke-width="3"/><text x="'+(x+18)+'" y="'+(y+52)+'" text-anchor="middle" font-size="10" fill="#222">TikTok</text>';}
    else s+='<rect x="'+x+'" y="'+y+'" width="36" height="36" rx="9" fill="#d9dde3"/>';
  }
  return s;
}
function header(name,icons){
  var s='<rect x="14" y="16" width="216" height="56" rx="20" fill="#0b6b5d"/><rect x="14" y="40" width="216" height="32" fill="#0b6b5d"/>'+
  '<path d="M34 36 l-8 8 l8 8" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="54" cy="44" r="13" fill="#c9ced6"/>'+
  '<text x="73" y="49" font-size="15" fill="#fff">'+name+'</text>';
  if(icons)s+='<rect x="150" y="37" width="18" height="14" rx="3" fill="none" stroke="#fff" stroke-width="2"/><polygon points="168,44 177,38 177,50" fill="#fff"/>'+
  '<path d="M189 37 q0 13 13 13" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>'+
  '<circle cx="217" cy="37" r="2" fill="#fff"/><circle cx="217" cy="44" r="2" fill="#fff"/><circle cx="217" cy="51" r="2" fill="#fff"/>';
  return s;
}
function chatBody(){
  return '<rect x="24" y="92" width="120" height="34" rx="10" fill="#eef0f2"/><rect x="100" y="142" width="116" height="34" rx="10" fill="#dcf8c6"/><rect x="24" y="192" width="140" height="34" rx="10" fill="#eef0f2"/>'+
  '<rect x="22" y="380" width="160" height="34" rx="17" fill="#eef0f2"/><circle cx="204" cy="397" r="17" fill="#0b6b5d"/>';
}
function listScreen(){
  var s='<rect x="14" y="16" width="216" height="56" rx="20" fill="#0b6b5d"/><rect x="14" y="40" width="216" height="32" fill="#0b6b5d"/><text x="30" y="52" font-size="17" fill="#fff" font-weight="700">WhatsApp</text>';
  for(var i=0;i<6;i++){var y=84+i*56;
    s+='<circle cx="42" cy="'+(y+22)+'" r="16" fill="#c9ced6"/>';
    s+=i===1?'<text x="66" y="'+(y+20)+'" font-size="15" fill="#222" font-weight="700">Ama</text>':'<rect x="66" y="'+(y+9)+'" width="90" height="9" rx="4" fill="#c9ced6"/>';
    s+='<rect x="66" y="'+(y+27)+'" width="120" height="7" rx="3" fill="#e3e6ea"/>';
  }
  return s;
}
function overlay(title,left,right){
  return '<rect x="14" y="16" width="216" height="408" rx="20" fill="#000" fill-opacity="0.45"/><rect x="30" y="170" width="184" height="110" rx="12" fill="#fff"/>'+
  '<text x="46" y="206" font-size="15" fill="#222" font-weight="700">'+title+'</text>'+
  '<text x="108" y="258" text-anchor="middle" font-size="14" fill="#5b6272">'+left+'</text><text x="182" y="258" text-anchor="middle" font-size="14" fill="#0b6b5d" font-weight="700">'+right+'</text>';
}
function groupInfo(red){
  var s='<circle cx="122" cy="84" r="32" fill="#c9ced6"/><text x="122" y="140" text-anchor="middle" font-size="16" fill="#222" font-weight="700">New group</text>';
  for(var i=0;i<4;i++)s+='<rect x="30" y="'+(166+i*44)+'" width="'+(150-i*14)+'" height="10" rx="5" fill="#e3e6ea"/>';
  s+='<text x="40" y="392" font-size="16" fill="#d93025" font-weight="700">'+red+'</text>';
  return s;
}
export const SCREENS={
  home:function(){return phone(homeScreen()+hl(74,194,48,64));},
  list:function(){return phone(listScreen()+hl(18,138,208,52));},
  chat:function(){return phone(header('Ama',true)+chatBody()+hl(143,29,40,30));},
  dialog:function(){return phone(header('Ama',true)+chatBody()+overlay('Start video call?','Cancel','Call')+hl(160,238,46,30));},
  calling:function(){return phone('<rect x="14" y="16" width="216" height="408" rx="20" fill="#0b3d36"/><circle cx="122" cy="150" r="40" fill="#c9ced6"/><text x="122" y="228" text-anchor="middle" font-size="20" fill="#fff">Ama</text><text x="122" y="254" text-anchor="middle" font-size="14" fill="#cfe8e2">Calling…</text><circle cx="122" cy="370" r="26" fill="#e0413a"/>');},
  gchat:function(){return phone(header('New group',false)+chatBody()+hl(64,29,96,30));},
  exitg:function(){return phone(groupInfo('Exit group')+hl(28,370,130,32));},
  exitd:function(){return phone(groupInfo('Exit group')+overlay('Exit this group?','Cancel','Exit')+hl(162,238,42,30));},
  delg:function(){return phone(groupInfo('Delete group')+hl(28,370,150,32));},
  deld:function(){return phone(groupInfo('Delete group')+overlay('Delete this group?','Cancel','Delete')+hl(154,238,56,30));},
  popup:function(){return phone(homeScreen()+'<rect x="28" y="140" width="188" height="140" rx="14" fill="#fff" stroke="#c9ced6" stroke-width="2"/><text x="44" y="172" font-size="14" fill="#222" font-weight="700">Software update</text><rect x="44" y="186" width="150" height="8" rx="4" fill="#e3e6ea"/><rect x="44" y="202" width="120" height="8" rx="4" fill="#e3e6ea"/><text x="84" y="258" text-anchor="middle" font-size="13" fill="#0b6b5d">Later</text><text x="170" y="258" text-anchor="middle" font-size="13" fill="#0b6b5d" font-weight="700">Install</text>');},
  side:function(){return phone(homeScreen()+hl(230,110,24,158));},
  tthome:function(){return phone(homeScreen()+hl(174,124,48,64));},
  ttfeed:function(){return phone('<rect x="14" y="16" width="216" height="408" rx="20" fill="#111820"/><rect x="100" y="120" width="44" height="120" rx="6" fill="#2b3442"/><rect x="14" y="370" width="216" height="54" fill="#000"/><rect x="100" y="380" width="44" height="30" rx="8" fill="#fff"/><text x="122" y="402" text-anchor="middle" font-size="22" fill="#000" font-weight="700">+</text><rect x="36" y="388" width="22" height="14" rx="3" fill="#6b7482"/><rect x="186" y="388" width="22" height="14" rx="3" fill="#6b7482"/>'+hl(92,372,60,46));},
  ttrec:function(){return phone('<rect x="14" y="16" width="216" height="408" rx="20" fill="#3b4656"/><circle cx="122" cy="200" r="46" fill="#566274"/><circle cx="122" cy="360" r="30" fill="#fff"/><circle cx="122" cy="360" r="23" fill="#fe2c55"/>'+hl(84,322,76,76));},
  ttnext:function(){return phone('<rect x="14" y="16" width="216" height="408" rx="20" fill="#3b4656"/><circle cx="122" cy="200" r="46" fill="#566274"/><rect x="150" y="372" width="66" height="36" rx="8" fill="#fe2c55"/><text x="183" y="395" text-anchor="middle" font-size="14" fill="#fff" font-weight="700">Next</text>'+hl(144,366,78,48));},
  ttpost:function(){return phone('<rect x="30" y="40" width="120" height="10" rx="5" fill="#e3e6ea"/><rect x="30" y="60" width="90" height="10" rx="5" fill="#e3e6ea"/><rect x="160" y="36" width="54" height="72" rx="6" fill="#c9ced6"/><rect x="30" y="140" width="184" height="8" rx="4" fill="#e3e6ea"/><rect x="30" y="170" width="160" height="8" rx="4" fill="#e3e6ea"/><rect x="30" y="200" width="170" height="8" rx="4" fill="#e3e6ea"/><rect x="26" y="372" width="90" height="38" rx="8" fill="#eef0f2"/><text x="71" y="396" text-anchor="middle" font-size="14" fill="#222">Drafts</text><rect x="126" y="372" width="92" height="38" rx="8" fill="#fe2c55"/><text x="172" y="396" text-anchor="middle" font-size="14" fill="#fff" font-weight="700">Post</text>'+hl(120,366,104,50));}
};

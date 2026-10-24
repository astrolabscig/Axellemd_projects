(function(){
  var DAY=864e5, now=Date.now();
  function at(d,h){var t=new Date(now+d*DAY);t.setHours(h||23,59,0,0);return t.getTime();}
  var ZONES={all:"All",deadline:"Deadlines",event:"Events",opportunity:"Opportunities",lost:"Lost & found"};
  var ZONE1={deadline:"Deadline",event:"Event",opportunity:"Opportunity",lost:"Lost & found"};
  var seed=[
    {zone:"deadline",what:"Course registration closes",from:"Academic office",when:"In 2 days, midnight",where:"University student portal",action:"Open portal",posted:now-5*DAY,expires:at(2)},
    {zone:"event",what:"Intro to Git workshop for Level 100s",from:"Open source club",when:"Saturday, 10:00 am",where:"Computer lab 2",action:"Save the date",posted:now-2*DAY,expires:at(4,12)},
    {zone:"opportunity",what:"Student tech internship: applications open",from:"Careers office",when:"Apply within 2 weeks",where:"Link in dept. WhatsApp group",action:"Apply",posted:now-1*DAY,expires:at(14)},
    {zone:"lost",what:"Found: blue flash drive, lecture hall B",from:"Department office",when:"Found Monday",where:"Collect at dept. office",action:"Claim it",posted:now-1*DAY,expires:at(6)},
    {zone:"event",what:"Society general meeting",from:"Student society",when:"Thursday, 5:30 pm",where:"Main auditorium",action:"Attend",posted:now-3*DAY,expires:at(1,18)},
    {zone:"deadline",what:"Mid-sem quiz moved to Friday",from:"Course rep",when:"Friday, 8:00 am",where:"Usual lecture room",action:"Note it",posted:now-1*DAY,expires:at(3,9)},
    {zone:"opportunity",what:"Writers wanted for the society newsletter",from:"Editorial board",when:"Pitches due in 10 days",where:"Email the editorial board",action:"Send a pitch",posted:now-2*DAY,expires:at(10)},
    {zone:"event",what:"Freshers' welcome party",from:"Hostel committee",when:"Last month",where:"Hostel forecourt",action:"—",posted:now-40*DAY,expires:now-20*DAY},
    {zone:"deadline",what:"First-semester fees deadline",from:"Accounts office",when:"Last month",where:"Bank",action:"—",posted:now-60*DAY,expires:now-30*DAY},
    {zone:"lost",what:"Lost: black umbrella",from:"A student",when:"Weeks ago",where:"Library",action:"—",posted:now-45*DAY,expires:now-15*DAY}
  ];
  var KEY="fsb-notices-v1", mine=[];
  try{mine=JSON.parse(localStorage.getItem(KEY)||"[]")||[];}catch(e){mine=[];}
  var zone="all", showExpired=false, freshId=null;

  function all(){return seed.map(function(n,i){n.id=n.id||"s"+i;return n;}).concat(mine);}
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
  function leftText(ms){var h=Math.round(ms/36e5);if(h<1)return"Comes down within the hour";if(h<48)return"Comes down in "+h+" hours";return"Comes down in "+Math.round(ms/DAY)+" days";}
  function waText(n){return "*"+n.what+"*\nWhen: "+n.when+"\nWhere: "+n.where+"\n(Shared from The 5-Second Board)";}

  function card(n,expired){
    var total=Math.max(n.expires-n.posted,1), rem=n.expires-Date.now(), pct=expired?100:Math.max(3,Math.min(97,(1-rem/total)*100));
    var soon=!expired&&rem<48*36e5;
    var h='<article class="card'+(n.id===freshId?' new':'')+'" data-zone="'+n.zone+'">'+
      '<div class="zone-name">'+ZONE1[n.zone]+'</div>'+
      '<h2 class="what">'+esc(n.what)+'</h2>'+
      '<dl class="facts"><dt>When</dt><dd>'+esc(n.when)+'</dd><dt>Where</dt><dd>'+esc(n.where)+'</dd>'+(n.from?'<dt>Posted by</dt><dd>'+esc(n.from)+'</dd>':'')+'</dl>'+
      '<div class="fuse" aria-hidden="true"><i style="width:'+pct+'%"></i></div>'+
      '<div class="left"><span class="'+(soon?'soon':'')+'">'+(expired?'Removed automatically on its expiry date':leftText(rem))+'</span>'+
      (!expired?'<span>Action: '+esc(n.action)+'</span>':'')+'</div>';
    if(!expired){h+='<div class="acts"><a class="wa" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(waText(n))+'">Send to WhatsApp</a><button type="button" data-copy="'+n.id+'">Copy text</button></div>';}
    return h+'</article>';
  }

  function render(){
    var t=Date.now(), list=all(), live=list.filter(function(n){return n.expires>t;}), dead=list.filter(function(n){return n.expires<=t;});
    live.sort(function(a,b){return a.expires-b.expires;});
    var z=document.getElementById("zones"); z.innerHTML="";
    Object.keys(ZONES).forEach(function(k){
      var c=k==="all"?live.length:live.filter(function(n){return n.zone===k;}).length;
      var b=document.createElement("button"); b.type="button"; b.setAttribute("aria-pressed",String(zone===k));
      b.innerHTML=ZONES[k]+'<span class="n">'+c+'</span>'; b.onclick=function(){zone=k;render();}; z.appendChild(b);
    });
    var shown=live.filter(function(n){return zone==="all"||n.zone===zone;});
    document.getElementById("list").innerHTML=shown.length?shown.map(function(n){return card(n,false);}).join(""):
      '<div class="empty"><strong>No live notices in '+ZONES[zone]+'.</strong><br>Post one and it will stay up until the date you choose.</div>';
    document.getElementById("health").innerHTML='<strong>'+live.length+' live notices.</strong> '+dead.length+' old notices were removed automatically, so they cannot cover newer ones. '+
      '<button type="button" id="tog">'+(showExpired?'Hide removed notices':'Show removed notices')+'</button>';
    document.getElementById("tog").onclick=function(){showExpired=!showExpired;render();};
    var ex=document.getElementById("expiredList"); ex.hidden=!showExpired;
    ex.innerHTML=showExpired?dead.map(function(n){return card(n,true);}).join(""):"";
    freshId=null;
  }

  function toast(m){var t=document.getElementById("toast");t.textContent=m;t.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(function(){t.style.display="none";},2200);}

  document.getElementById("list").addEventListener("click",function(e){
    var id=e.target.getAttribute&&e.target.getAttribute("data-copy"); if(!id)return;
    var n=all().filter(function(x){return x.id===id;})[0]; if(!n)return;
    try{navigator.clipboard.writeText(waText(n)).then(function(){toast("Copied. Paste it into any group.");},function(){toast("Copy blocked. Use Send to WhatsApp instead.");});}
    catch(err){toast("Copy blocked. Use Send to WhatsApp instead.");}
  });

  var dlg=document.getElementById("dlg"), f=function(id){return document.getElementById(id);};
  f("openPost").onclick=function(){f("form").reset();f("err").textContent="";f("count").textContent="(0/60)";
    var d=new Date(now+7*DAY);f("f-exp").value=d.toISOString().slice(0,10);
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute("open","");f("f-what").focus();};
  f("cancel").onclick=function(){dlg.close();};
  f("f-what").oninput=function(){f("count").textContent="("+this.value.length+"/60)";};
  f("form").onsubmit=function(e){
    e.preventDefault();
    var what=f("f-what").value.trim(),when=f("f-when").value.trim(),where=f("f-where").value.trim(),action=f("f-action").value.trim()||"Read",exp=f("f-exp").value;
    if(!what||!when||!where){f("err").textContent="Fill in What, When and Where. Those are the three lines people read first.";return;}
    if(!exp){f("err").textContent="Choose a removal date so this notice doesn't cover newer ones.";return;}
    var e2=new Date(exp+"T23:59:00").getTime();
    if(e2<=Date.now()){f("err").textContent="The removal date has already passed. Pick a future date.";return;}
    if(e2>Date.now()+31*DAY){f("err").textContent="Pick a removal date within 30 days. Longer notices go stale.";return;}
    var n={id:"m"+Date.now(),zone:f("f-zone").value,what:what,when:when,where:where,action:action,from:f("f-from").value.trim(),posted:Date.now(),expires:e2};
    mine.push(n); try{localStorage.setItem(KEY,JSON.stringify(mine));}catch(err){}
    freshId=n.id; zone="all"; dlg.close(); render(); toast("Posted. It will be removed on "+new Date(e2).toDateString()+".");
  };
  render();
})();

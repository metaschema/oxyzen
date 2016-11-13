//OXYGEN for firebase by Hideki Yamamoto & Gioele Cerati
/*TODO URGENT!!!!!!
	-Use doctitles dedicated Ndex for autocompletes
		-[NEW FUNCTION] -Add index for _subcollections 	
*/
f$={oxyprefix:'OXY/',
inoe:function(v){if(!v)return true;if(typeof v!='string')return true;if(v.length==0)return true;return false;},
login:function(provider,method){if(!method){method='redirect'}provider=provider.toLowerCase();
	if (!firebase.auth().currentUser){var provider;
		if(provider=='twitter'){provider=new firebase.auth.TwitterAuthProvider();}
		else if(provider=='google'){provider=new firebase.auth.GoogleAuthProvider();console.log('glogin');		
		provider.addScope('https://www.googleapis.com/auth/devstorage.full_control');}
		else if(provider=='github'){provider=new firebase.auth.GithubAuthProvider();provider.addScope('repo');}
		else if(provider=='facebook'){provider=new firebase.auth.FacebookAuthProvider();provider.addScope('user_likes');}
		if(method=='redirect'){firebase.auth().signInWithRedirect(provider);}}else{console.log('Already logged in');}},
logout:function(){firebase.auth().signOut();},
initAuth:function(nextToken){if(!nextToken){nextToken=function(r){var i=0;}}firebase.auth().getRedirectResult().then(function(result){f$.user = result.user;
 if(result.credential){f$.user.token = result.credential.accessToken;nextToken(result);}else{  nextToken(false);}
  }).catch(function(error) {if (error.code === 'auth/account-exists-with-different-credential') {
			alert('You have already signed up with a different auth provider for that email.');
   // TODO: merge multiple user accounts here.
}else{console.error(error);}});},
/* ----------------------------------------------------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------- FIREBASE DATABASE NAMESPACE - START */
db:{docnamefield:"doctitle",collections:['tag','generic','file'],db:function(ref){return firebase.database().ref(ref)},
scan:function(next){f$.db.afterscan=next;
	var scanurl=firebase.database().app.options.databaseURL+'/.json?shallow=true&callback=f$.db._scanloaded';
	var ascr=document.createElement('script');ascr.src=scanurl;ascr.setAttribute('type','text/javascript');
	document.getElementsByTagName('head')[0].appendChild(ascr);},
_scanloaded:function(scandata){var c;f$.db.collections=[];for(c in scandata){if(c!=f$.oxyprefix.replace('/','')){if(scandata[c]===true){f$.db.collections[f$.db.collections.length]=c}}}f$.db.afterscan(f$.db.collections)},
start:function(key,event,next){this.db(key.replace('-','/-')).on(event,function(d){var v=d.val();if(v){v.$key=key.split('-')[0]+d.key;next(v);}});},
end:function(key,event){this.db(key.replace('-','/-')).off(event);},
/* --------------------------------------------------------------------------------------------- SUBCOLLECTION START */
_add:function(stype,dkey,json){return this.db(stype+'_'+dkey.replace('-','/-')).push(json).key;},
_set:function(stype,dkey,key,json){delete json.subkey;this.db(stype+'_'+dkey.replace('-','/-')+'/'+key).set(json);},
_del:function(stype,dkey,key){this.db(stype+'_'+dkey.replace('-','/-')+'/'+key).remove();},
_get:function(stype,dkey,next){this.db(stype+'_'+dkey.replace('-','/-')).on('child_added',function(data){var v=data.val();v.$subkey=data.key;next(v);});},
_getone:function(stype,dkey,key,next){this.db(stype+'_'+dkey.replace('-','/-')+'/'+key).once('value',function(data){var v=data.val();v.$subkey=data.key;next(v);});},
/* SUBCOLLECTION END ------------------------------------------------------------------------------ COLLECTION START */
getonce:function(key,next,nextrem){this.db(key.replace('-','/')).once('value',function(d){var v=d.val();if(v){v.$key=key;next(v);}else{if(nextrem){nextrem(key)}}});},
getone:function(key,next,nextrem){this.db(key.replace('-','/')).on('value',function(d){var v=d.val();if(v){v.$key=key;next(v);}else{if(nextrem){nextrem(key)}}});},
getall:function(col,next,nextrem){var x=this.db('/'+col);x.off('child_added');x.off('child_changed');x.off('child_removed');
	x.on('child_added',function(d){var v=d.val();v.$key=col+'-'+d.key;next(v)});
	x.on('child_changed',function(d){var v=d.val();v.$key=col+'-'+d.key;next(v)});
	x.on('child_removed',function(snap){var k=col+'+'+snap.key;nextrem(k)});},
add:function(otype,doc){if(f$.inoe(doc[this.docnamefield])){doc[this.docnamefield]='new '+otype;}if(!doc.parent){doc.parent='tag-root';doc.ptitle='root'}
	var x=this.db(otype).push(doc).key;this._add(f$.oxyprefix+'log',otype+x,{text:"Object Created"});
	var nkey=otype+'-'+x;this._doindex(doc,nkey,this.docnamefield);doc.$key=nkey;return doc;},
del:function(key){var _this=this;var doend=function(){_this.db('/'+f$.oxyprefix+'log_'+key.replace('-','/')).remove();
	_this.db('/'+f$.oxyprefix+'ver_'+key.replace('-','/')).remove();_this.db('/'+key.replace('-','/')).remove();
	_this.db('/'+f$.oxyprefix+'invdex/'+key).once('value',function(snap){var IDX=snap.val();var v;_this.db('/'+f$.oxyprefix+'invdex/'+key).remove();
	for(v in IDX.all){_this.db('/'+f$.oxyprefix+'Wndex/'+v+'/'+key).remove();}for(v in IDX.hash){_this.db('/'+f$.oxyprefix+'Hndex/'+v+'/'+key).remove();}});};
	this.getonce(key,function(d){for(var k in d.rels){_this.db(k.replace('-','/')+'/rels/'+key).remove();
	_this._add(f$.oxyprefix+'log',k,{text:'Unlinked from '+d[_this.docnamefield]+'['+key+'] because it\'s getting deleted.'});
	}doend();});},
set:function(doc,log,_first,_skipreindex){var _this=this;var k=doc.$key;if(!_skipreindex){this._doindex(doc,k,this.docnamefield);}delete doc.$key;if(!log){log='Object Modified'}
	if(_first){_this.db(k.replace('-','/')).set(doc);this._add(f$.oxyprefix+'log',k,{text:"Object Created"});}
	else{this.getonce(k,function(d){delete d.$key;var verk=_this._add(f$.oxyprefix+"ver",k,d);
	_this.db(k.replace('-','/')).set(doc);_this._add(f$.oxyprefix+'log',k,{text:log,prev:verk});});}},
update:function(doc,log,_first){this.set(doc,log,_first,true);},
/* COLLECTION END ---------------------------------------------------------------------------------- RELATIONS START */
setparent:function(k,pk,_pn){var _this=this;
	if(!_pn){this.db(pk.replace('-','/')+'/'+f$.docnamefield).once('value',function(snap){
		var v=snap.val();_this.db(k.replace('-','/')).update({"parent":pk,"ptitle":v});})}
	else{this.db(k.replace('-','/')).update({"parent":pk,"ptitle":_pn})}},
link:function(k1,k2,json){console.log('kok2');if(!json){json={r:'default'}}if(!json.r){json.r='default'}if(f$.inoe(k1)||(f$.inoe(k2))){console.log('only valid keys')}else{
	var _this=this;this.getonce(k1,function(d){_this.getonce(k2,function(dd){var j2=json;
	json.n=dd[_this.docnamefield];_this.db(k1.replace('-','/')+'/rels/'+k2).set(json);_this._add(f$.oxyprefix+'log',k1,{text:'Linked with '+dd[_this.docnamefield]+'['+k2+']'});
	j2.n=d[_this.docnamefield];_this.db(k2.replace('-','/')+'/rels/'+k1).set(j2);_this._add(f$.oxyprefix+'log',k2,{text:'Linked with '+d[_this.docnamefield]+'['+k1+']'});
});});}},
unlink:function(k1,k2){if(f$.inoe(k1)||(f$.inoe(k2))){console.log('only valid keys')}else{
	var _this=this;this.getonce(k1,function(d){_this.getonce(k2,function(dd){
	_this.db(k1.replace('-','/')+'/rels/'+k2).remove();_this._add(f$.oxyprefix+'log',k1,{text:'Unlinked from '+dd[_this.docnamefield]+'['+k2+']'});
	_this.db(k2.replace('-','/')+'/rels/'+k1).remove();_this._add(f$.oxyprefix+'log',k2,{text:'Unlinked from '+d[_this.docnamefield]+'['+k1+']'});
});});}},	
linkmany:function(k1,kk,json){var _this=this;if(!json){json={r:'default'}}if(!json.r){json.r='default'}this.getonce(k1,function(dd){for(var k=0;k<kk.length;k++){_this.getonce(kk[k],function(ddd){
	_this.db(k1.replace('-','/')+'/rels/'+kk[k]).set(json);_this._add(f$.oxyprefix+'log',k1,{text:'Linked with '+ddd[_this.docnamefield]+'['+kk[k]+']'});
	_this.db(kk[k].replace('-','/')+'/rels/'+k1).set(json);_this._add(f$.oxyprefix+'log',kk[k],{text:'Linked with '+dd[_this.docnamefield]+'['+k1+']'});
});}});},
unlinkmany:function(k1,kk){var _this=this;this.getonce(k1,function(dd){for(var k=0;k<kk.length;k++){this.getonce(kk[k],function(ddd){
	_this.db(k1.replace('-','/')+'/rels/'+kk[k]).remove();_this._add(f$.oxyprefix+'log',k1,{text:'Unlinked with '+ddd[_this.docnamefield]+'['+kk[k]+']'});
	_this.db(kk[k].replace('-','/')+'/rels/'+k1).remove();_this._add(f$.oxyprefix+'log',kk[k],{text:'Unlinked with '+dd[_this.docnamefield]+'['+k1+']'});
});}});},
/* RELATIONS END ------------------------------------------------------------------------------------- INDEXES START */
clearmetaschema:function(){firebase.database().ref(f$.oxyprefix).on('child_added',function(snap){firebase.database().ref(f$.oxyprefix+snap.key).remove()})},
reindexcollections:function(colls,stepfn,endfn){if(!colls){colls=f$.db.collections}window.LOCDX={Wndex:{},Hndex:{},invdex:{},done:[]};LOCDX.colls=colls;this._loop_reindexcollections(stepfn,endfn);},
_loop_reindexcollections:function(stepfn,endfn){if(LOCDX.done.length<LOCDX.colls.length){
	this._reindexcollection(LOCDX.colls[LOCDX.done.length],stepfn,function(cn,c,t){LOCDX.done[LOCDX.done.length]=cn;
			console.log('FINESHED INDEXING '+LOCDX.done[LOCDX.done.length-1]);f$.db._loop_reindexcollections(stepfn,endfn);});
	}else{console.log('FINESHED INDEXING ALL');
	delete LOCDX.done;delete LOCDX.colls;LOCDX.donotindex={};LOCDX.Hdonotindex={};
	var w='';var W='';var n;var k;
	for(w in LOCDX.Wndex){n=0;W=LOCDX.Wndex[w];for(k in W){n++}if(n>550){delete LOCDX.Wndex[w];LOCDX.donotindex[w]=n}}
	for(w in LOCDX.Hndex){n=0;W=LOCDX.Hndex[w];for(k in W){n++}if(n>550){delete LOCDX.Hndex[w];LOCDX.Hdonotindex[w]=n}}
	endfn(LOCDX);}},
_reindexcollection:function(collname,stepfn,endfn){var _this=this;this.db('/'+collname).once("value",function(snap){
	var docs=snap.val();var ct=0;var d ='';var tot=Object.keys(docs).length;var s;if(!stepfn){stepfn=_this._reindexlog}if(!endfn){endfn=_this._endreindexlog}
	for(d in docs){ct++;stepfn(collname,ct,tot);
		f$.db._doindex2(docs[d],collname+"-"+d,'doctitle');			
	}endfn(collname,ct,tot);});},
_reindexlog:function(cn,c,t){console.log('Reindexed '+cn+' '+c+'/'+t)},_endreindexlog:function(c,t){console.log('FINISHED REINDEXING '+cn+' '+c+'/'+t)},
find:function(s,next,nextrem,_collections){if(!_collections){_collections=this.collections}
	if(s=='all'){for(var c=0;c<_collections.length;c++){this.getall(_collections[c],next,nextrem)}}
	else if(s.indexOf('key:')==0){this.getone(s.replace('key:',''),next,nextrem);}
	else if(s.indexOf('rel:')==0){var cn;	
		var fn=function(v){return function(snap){var d=snap.val();d.$key=v+'-'+snap.key;next(d)}}
		var fn2=function(v){return function(snap){var d=snap.val();d.$key=v+'-'+snap.key;nextrem(d)}}
		for(var c=0;c<_collections.length;c++){cn=_collections[c];
			var tr=firebase.database().ref(cn).orderByChild('rels/'+s.replace('rel:','')+'/r').startAt('0').endAt('z');
			tr.off('child_added');tr.off('child_changed');tr.off('child_removed');
			tr.on('child_added',fn(cn));tr.on('child_changed',fn(cn));tr.on('child_removed',fn2);
	}}else if(s.indexOf('parent:')==0){var k=s.replace('parent:','');var cn;var colname="parent";
		var fn=function(v){return function(snap){var d=snap.val();d.$key=v+'-'+snap.key;next(d)}}
		var fn2=function(v){return function(snap){var d=snap.val();d.$key=v+'-'+snap.key;nextrem(d)}}
		for(var c=0;c<_collections.length;c++){cn=_collections[c];
			var tr=firebase.database().ref(cn).orderByChild(colname).startAt(k).endAt(k);tr.off('child_added');tr.off('child_changed');tr.off('child_removed');
			tr.on('child_added',fn(cn));tr.on('child_changed',fn(cn));tr.on('child_removed',fn2);
	}}else{var _this=this;var popped=[];var xx=s.split(' ');var xlen=xx.length;
		s=s.replace(/\n|\t|\r|{|}|\||<|>|\\|!|"|£|$|%|&|\/|\(|\)|=|\?|'|"|^|\*|\+|\[|\]|§|°|@|\.|,|;|:/g,' ');
		s=s.replace(/# /g,' ');s=s.replace(/   /g,' ');s=s.replace(/  /g,' ');s=s.toLowerCase();
	var uninext=function(d){if(!popped[d.$key]){popped[d.$key]=1;}else{popped[d.$key]++}if(popped[d.$key]>=xlen){next(d);}};
	var step=function(d){_this.getone(d.key,uninext,nextrem);}
	for(var x=0;x<xlen;x++){xx[x]=xx[x].trim();if(xx[x].length>2){var tref=null;
		if(xx[x][0]=='#'){/*search in hashed index*/
			tref=_this.db('/'+f$.oxyprefix+'Hndex/'+xx[x].substr(1)+'/');tref.off('child_added',step);tref.off('child_changed',step);
			tref.on('child_added',step);tref.on('child_changed',step);tref.on('child_removed',steprem);		
		}else{/*search in all words index index*/
	tref=_this.db('/'+f$.oxyprefix+'Wndex/'+xx[x]+'/');tref.off('child_added',step);tref.off('child_changed',step);tref.on('child_added',step);tref.on('child_changed',step);}}}}},		
_doindex:function(o,k,f){var _this=this;var j;var RT=this._relevantText(o);var IDX=this._indexAllandHashedWords(RT); 
	this.db('/'+f$.oxyprefix+'invdex/'+k).once('value',function(snap){var OIDX=snap.val();
	if(OIDX){/*INDEX UPDATE*/var flag=false;if(!OIDX.hash){OIDX.hash={}}if(!OIDX.all){OIDX.all={}}
		for(j in IDX.all){if(j!=''){if(!OIDX.all[j]){_this.db('/'+f$.oxyprefix+'Wndex/'+j+'/'+k).set({ct:IDX.all[j]});}else{OIDX.all[j]={kkk:true}}}}
		for(j in IDX.hash){if(j!=''){if(!OIDX.hash[j]){_this.db('/'+f$.oxyprefix+'Hndex/'+j+'/'+k).set({ct:IDX.hash[j]});}else{OIDX.hash[j]={kkk:true}}}}
		for(j in OIDX.all){if(j!=''){flag=false;if(!IDX.all[j]){flag=true;}else if(!OIDX.all[j].kkk){flag=true;}if(flag){_this.db('/'+f$.oxyprefix+'Wndex/'+j+'/'+k).remove();}}}
		for(j in OIDX.hash){if(j!=''){flag=false;if(!IDX.hash[j]){flag=true}else if(!OIDX.hash[j].kkk){flag=true}if(flag){_this.db('/'+f$.oxyprefix+'Hndex/'+j+'/'+k).remove();}}}
	}else{/*INDEX ONLY*/for(j in IDX.all){if(j!=''){_this.db('/'+f$.oxyprefix+'Wndex/'+j+'/'+k).set({ct:IDX.all[j]});}}
		for(j in IDX.hash){if(j!=''){_this.db('/'+f$.oxyprefix+'Hndex/'+j+'/'+k).set({ct:IDX.hash[j]});}}}
		_this.db('/'+f$.oxyprefix+'invdex/'+k).set(IDX);});},
_doindex2:function(o,k,f){var _this=this;var j;var RT=this._relevantText(o);var IDX=this._indexAllandHashedWords(RT); 
	for(j in IDX.all){if(j!=''){if(!LOCDX.Wndex[j]){LOCDX.Wndex[j]={};}LOCDX.Wndex[j][k]={ct:IDX.all[j]};}}
	var has=false; for(j in IDX.hash){if(j!=''){has=true;if(!LOCDX.Hndex[j]){LOCDX.Hndex[j]={};}LOCDX.Hndex[j][k]={ct:IDX.hash[j]};}}
	if(!has){delete IDX.hash}
	LOCDX.invdex[k]=IDX;},
_indexAllandHashedWords:function(s){var out={all:{},hash:{}};var c=0;var cw='';var ct=1;var gh='';var ss=s.split(' ').sort();var len=ss.length;while((c<len)&&(ss[c].trim()=='')){c++}
	while(c<len){gh=ss[c].trim();if(cw!=gh){if(cw!=''){if(cw.length>2){out.all[cw.replace('#','')]=ct};if(cw!='#'){if(cw[0]=='#'){out.hash[cw.replace('#','')]=ct;}}}cw=gh;ct=1;}else{ct++}c++}
	out.all[cw]={v:cw,c:ct};return out;},
_relevantText:function(o){var s=JSON.stringify(o);s=s.replace(/\\n/g,' ');s=s.replace(/,"([^"]*)":/g,'');s=s.replace(/{"([^"]*)":/g,'');
	s=s.replace(/","/g,' ');s=s.replace(/""/g,' ');s=s.replace(/"/g,' ');
	s=s.replace(/<([^>]+)\/>/g,' ');s=s.replace(/(<([^>]+)>)/ig,'');s=s.replace(/<link .*>/g,' ');
	s=s.replace(/{|}|\||<|>|\\|!|"|£|$|%|&|\/|\(|\)|=|\?|'|"|^|\*|\+|\[|\]|§|°|@|\.|,|;|:|-/g,' ');
	s=s.replace(/  /g,' ');s=s.replace(/   /g,' ');s=s.replace(/  /g,' ');return s.toLowerCase()},},
/* ------------------------------------------------------------------------------------------------- INDEXES end */
/* ----------------------------------------------------------------------------------------------- STORAGE START */	
fs:{tagparent:'tag--KRKRoP7M9JVhp9Toz8m',fs:function(k){return firebase.storage().ref().child(k)},
	add:function(file,next){this.fs(file.name).put(file).then(function(snap){var d=snap.metadata;for(var k in d){if(!d[k]){delete d[k]}}d.$key='file-'+d.fullPath.replace('.','*');d.parent=f$.fs.tagparent;d.ptitle='UPLOADS';delete d.bucket;d.doctitle=d.name;delete d.name;delete d.metageneration;delete d.generation;f$.db.set(d,'File uploaded',true);if(next){next(d);}});},
	set:function(file,next){this.fs(file.name).put(file).then(function(snap){var d=snap.metadata;for(var k in d){if(!d[k]){delete d[k]}}d.$key='file-'+d.fullPath.replace('.','*');d.parent=f$.fs.tagparent;d.parent='UPLOADS';delete d.bucket;d.doctitle=d.name;delete d.name;delete d.metageneration;delete d.generation;f$.db.set(d,'File uploaded');if(next){next(d);}});},
	del:function(key){f$.db.del(key);this.fs(key.substr(key.indexOf('-')+1).replace('*','.')).delete();},
},	
/* ------------------------------------------------------------------------------------------------- STORAGE end */
};

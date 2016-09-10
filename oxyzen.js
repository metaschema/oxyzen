//OXYGEN for firebase by Hideki Yamamoto
/*TODO URGENT!!!!!!
	-Use doctitles dedicated Ndex for autocompletes
		-[NEW FUNCTION] -Add index for _subcollections 	
*/
f$={dbnamespace:'OZ',oxyprefix:'OZ/',
inoe:function(v){if(!v)return true;if(typeof v!='string')return true;if(v.length==0)return true;return false;},
login:function(provider,method){if(!method){method='redirect'}
	if (!firebase.auth().currentUser){var provider;
		if(provider=='twitter'){provider=new firebase.auth.TwitterAuthProvider();}
		else if(provider=='google'){provider=new firebase.auth.GoogleAuthProvider();		
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
db:{docnamefield:"doctitle",db:function(ref){return firebase.database().ref(ref)},
	start:function(key,event,next){this.db(key.replace('-','/-')).on(event,function(d){var v=d.val();if(v){v.$key=key.split('-')[0]+d.key;next(v);}});},
	end:function(key,event){this.db(key.replace('-','/-')).off(event);},
/* --------------------------------------------------------------------------------------------- SUBCOLLECTION START */
	_add:function(stype,dkey,json){return this.db(stype+'_'+dkey.replace('-','/-')).push(json).key;},
	_set:function(stype,dkey,key,json){delete json.subkey;this.db(stype+'_'+dkey.replace('-','/-')+'/'+key).set(json);},
	_del:function(stype,dkey,key){this.db(stype+'_'+dkey.replace('-','/-')+'/'+key).remove();},
	_get:function(stype,dkey,next){this.db(stype+'_'+dkey.replace('-','/-')).on('child_added',function(data){var v=data.val();v.$subkey=data.key;next(v);});},
	_getone:function(stype,dkey,key,next){this.db(stype+'_'+dkey.replace('-','/-')+'/'+key).once('value',function(data){var v=data.val();v.$subkey=data.key;next(v);});},
/* SUBCOLLECTION END ------------------------------------------------------------------------------ COLLECTION START */
	getone:function(key,next){this.db(key.replace('-','/')).once('value',function(d){var v=d.val();if(v){v.$key=key;next(v);}});},
	getall:function(col,next){this.db('/'+col).on('child_added',function(d){var v=d.val();v.$key=col+d.key;next(v)})},
	add:function(otype,doc){if(f$.inoe(doc[this.docnamefield])){doc[this.docnamefield]='new '+otype;}var x=this.db(otype).push(doc).key;this._add(f$.oxyprefix+'log',otype+x,{text:"Object Created"});
		var nkey=otype+'-'+x;this._doindex(doc,nkey,this.docnamefield);doc.$key=nkey;return doc;},
	del:function(key){var _this=this;var doend=function(){_this.db('/'+f$.oxyprefix+'log_'+key.replace('-','/')).remove();
		_this.db('/'+f$.oxyprefix+'ver_'+key.replace('-','/')).remove();_this.db('/'+key.replace('-','/')).remove();
			_this.db('/'+f$.oxyprefix+'invdex/'+key).once('value',function(snap){var IDX=snap.val();var v;_this.db('/'+f$.oxyprefix+'invdex/'+key).remove();
				for(v in IDX.all){_this.db('/'+f$.oxyprefix+'Wndex/'+v+'/'+key).remove();}for(v in IDX.hash){_this.db('/'+f$.oxyprefix+'Hndex/'+v+'/'+key).remove();}});};
		this.getone(key,function(d){for(var k in d.rels){_this.db(k.replace('-','/')+'/rels/'+key).remove();
			_this._add(f$.oxyprefix+'log',k,{text:'Unlinked from '+d[_this.docnamefield]+'['+key+'] because it\'s getting deleted.'});
	}doend();});},
	set:function(doc,log,_first){var _this=this;var k=doc.$key;this._doindex(doc,k,this.docnamefield);delete doc.$key;if(!log){log='Object Modified'}
		if(_first){_this.db(k.replace('-','/')).set(doc);this._add(f$.oxyprefix+'log',k,{text:"Object Created"});}
		else{this.getone(k,function(d){delete d.$key;var verk=_this._add(f$.oxyprefix+"ver",k,d);
			_this.db(k.replace('-','/')).set(doc);_this._add(f$.oxyprefix+'log',k,{text:log,prev:verk});});}},
/* COLLECTION END ---------------------------------------------------------------------------------- RELATIONS START */
	link:function(k1,k2,json){console.log('kok2');if(!json){json={role:'default'}}if(f$.inoe(k1)||(f$.inoe(k2))){console.log('only valid keys')}else{
		var _this=this;this.getone(k1,function(d){_this.getone(k2,function(dd){var j2=json;
			json.n=dd[_this.docnamefield];_this.db(k1.replace('-','/')+'/rels/'+k2).set(json);_this._add(f$.oxyprefix+'log',k1,{text:'Linked with '+dd[_this.docnamefield]+'['+k2+']'});
			j2.n=d[_this.docnamefield];_this.db(k2.replace('-','/')+'/rels/'+k1).set(j2);_this._add(f$.oxyprefix+'log',k2,{text:'Linked with '+d[_this.docnamefield]+'['+k1+']'});
	});});}},
	unlink:function(k1,k2){if(f$.inoe(k1)||(f$.inoe(k2))){console.log('only valid keys')}else{
		var _this=this;this.getone(k1,function(d){_this.getone(k2,function(dd){
			_this.db(k1.replace('-','/')+'/rels/'+k2).remove();_this._add(f$.oxyprefix+'log',k1,{text:'Unlinked from '+dd[_this.docnamefield]+'['+k2+']'});
			_this.db(k2.replace('-','/')+'/rels/'+k1).remove();_this._add(f$.oxyprefix+'log',k2,{text:'Unlinked from '+d[_this.docnamefield]+'['+k1+']'});
	});});}},	
	linkmany:function(k1,kk,json){var _this=this;this.getone(k1,function(dd){for(var k=0;k<kk.length;k++){_this.getone(kk[k],function(ddd){
			_this.db(k1.replace('-','/')+'/rels/'+kk[k]).set(json);_this._add(f$.oxyprefix+'log',k1,{text:'Linked with '+ddd[_this.docnamefield]+'['+kk[k]+']'});
			_this.db(kk[k].replace('-','/')+'/rels/'+k1).set(json);_this._add(f$.oxyprefix+'log',kk[k],{text:'Linked with '+dd[_this.docnamefield]+'['+k1+']'});
	});}});},
	unlinkmany:function(k1,kk){var _this=this;this.getone(k1,function(dd){for(var k=0;k<kk.length;k++){this.getone(kk[k],function(ddd){
			_this.db(k1.replace('-','/')+'/rels/'+kk[k]).remove();_this._add(f$.oxyprefix+'log',k1,{text:'Unlinked with '+ddd[_this.docnamefield]+'['+kk[k]+']'});
			_this.db(kk[k].replace('-','/')+'/rels/'+k1).remove();_this._add(f$.oxyprefix+'log',kk[k],{text:'Unlinked with '+dd[_this.docnamefield]+'['+k1+']'});
	});}});},
/* RELATIONS END ------------------------------------------------------------------------------------- INDEXES START */
 clearmetaschema:function(){firebase.database().ref(f$.oxyprefix).on('child_added',function(snap){firebase.database().ref(f$.oxyprefix+snap.key).remove()})},
	reindexcollection:function(collname){var _this=this;this.db('/'+collname).on("child_added",function(d){_this._doindex(d.val(),collname+'-'+d.key,'doctitle');console.log('reindexed '+d.key);});},
	find:function(s,next,nextrem,_collection){var _this=this;var popped=[];
		s=s.replace(/\n|\t|\r|{|}|\||<|>|\\|!|"|£|$|%|&|\/|\(|\)|=|\?|'|"|^|\*|\+|\[|\]|§|°|@|\.|,|;|:/g,' ');
		s=s.replace(/# /g,' ');s=s.replace(/   /g,' ');s=s.replace(/  /g,' ');s=s.toLowerCase();
		var uninext=function(d){if(!popped[d.$key]){popped[d.$key]=true;next(d);}};var step;
		if(_collection){step=function(d){if(d.key.indexOf(_collection)==0){_this.getone(d.key,uninext);}}}
		else{step=function(d){_this.getone(d.key,uninext);}}
		var xx=s.split(' ');var xlen=xx.length;for(var x=0;x<xlen;x++){xx[x]=xx[x].trim();if(xx[x].length>2){var tref=null;
			if(xx[x][0]=='#'){/*search in hashed index*/
				tref=_this.db('/'+f$.oxyprefix+'Hndex/'+xx[x].substr(1)+'/');tref.off('child_added',step);tref.off('child_changed',step);
				tref.on('child_added',step);tref.on('child_changed',step);tref.on('child_removed',steprem);		
			}else{/*search in all words index index*/
				tref=_this.db('/'+f$.oxyprefix+'Wndex/'+xx[x]+'/');tref.off('child_added',step);tref.off('child_changed',step);tref.on('child_added',step);tref.on('child_changed',step);}}}},		
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
	_indexAllandHashedWords:function(s){var out={all:{},hash:{}};var c=0;var cw='';var ct=1;var gh='';var ss=s.split(' ').sort();var len=ss.length;while((c<len)&&(ss[c].trim()=='')){c++}
		while(c<len){gh=ss[c].trim();if(cw!=gh){if(cw!=''){if(cw.length>2){out.all[cw.replace('#','')]=ct};if(cw[0]=='#'){out.hash[cw.replace('#','')]=ct;}}cw=gh;ct=1;}else{ct++}c++}
		out.all[cw]={v:cw,c:ct};return out;},
	_relevantText:function(o){var s=JSON.stringify(o);s=s.replace(/\\n/g,' ');s=s.replace(/,"([^"]*)":/g,'');s=s.replace(/{"([^"]*)":/g,'');
		s=s.replace(/","/g,' ');s=s.replace(/""/g,' ');s=s.replace(/"/g,' ');
		s=s.replace(/<.*\/>/g,' ');s=s.replace(/(<([^>]+)>)/ig,'');s=s.replace(/<link .*>/g,' ');
		s=s.replace(/{|}|\||<|>|\\|!|"|£|$|%|&|\/|\(|\)|=|\?|'|"|^|\*|\+|\[|\]|§|°|@|\.|,|;|:|-/g,' ');
		s=s.replace(/  /g,' ');s=s.replace(/   /g,' ');s=s.replace(/  /g,' ');return s.toLowerCase()},},
	/* ------------------------------------------------------------------------------------------------- INDEXES end */
	/* ----------------------------------------------------------------------------------------------- STORAGE START */	
	fs:{fs:function(k){return firebase.storage().ref().child(k)},
		list:function(path,next){
			
		},
		add:function(file,next){this.fs(file.name).put(file).then(function(snap){var d=snap.metadata;for(var k in d){if(!d[k]){delete d[k]}}d.$key='file-'+d.fullPath.replace('.','*');f$.db.set(d,'File uploaded',true);if(next){next(d);}});},
		set:function(file,next){this.fs(file.name).put(file).then(function(snap){var d=snap.metadata;for(var k in d){if(!d[k]){delete d[k]}}d.$key='file-'+d.fullPath.replace('.','*');f$.db.set(d,'File uploaded');if(next){next(d);}});},
		del:function(path,next){
			
		},
	}
  };
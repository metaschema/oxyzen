# Oxyzen

In json's dbs the structure is pretty much free, however,  except for special occasions, I' ve seen the "document collection concept" being a favourite, scalable and reusable, sharable also, talking with people, and finally it's most similar to that of tables and records, from sql.

Many, many, many projects could be covered by a bunch of collections, given firebase's integrated login.
I figured, if i was to use a document collections structure for a project I could as well benefit from the know factors of the data structure.

Given your db follows or can follow a "collectionS of documentS structure", this project is a javascript library meant to use with firebase in web applications. It enables some handy feat, with extreme ease of use:

- Cross collection recursive treeeness for all the documents, by adding the property parent in the format "collname-dockey".
- N<->N relations with metadata,easy querizable, by adding a rel property that have childs in the format  "collname-dockey".
- Searchable word text index + Hashwords index + Titles index (latter one is todo).
- A subcollection utility, to easily handle subdocuments.
- Using the above subcollection utility, a documents changes log AND a versioning subcollection are automagically integrated.
- Cool trick: storage uploads are also stored as documents in a collections, so every other functionality listed above, also applies for storage uploads, most handful to handle directly like listing of files, missing in native storage api.

Basic library test form.
https://cdn.rawgit.com/metaschema/oxyzen/master/index.html 

And our fully featured gui, metaschema, the best way to use oxyzen.
https://cdn.rawgit.com/metaschema/metaschema/master/app.html


# How it works

- Ugly but coeherently manageable _key attribut is added to documents during runtime (not stored in the db),  in the format collectionname-documentkey - this enables for example replations to ony require one attribute to reference any document in any collection, or enabled any document in any collection to be the parent of any other.

# Indexing and searching
Reindexing features help starting with an already existing db :
 
- f$.db.clearmetaschema() - explicitely deletes any data used by the oxyzen library.
- f$.db.scan(nextfn) - using lightweight shallow query via REST, gets a list of the collections present in the database.
- f$.db.reindexcollections(_colls,stepfn,endfn) - reindexes specified collections, if colls is set to false, all scanned collections are reindexed.

The indexes are searched using the find function as follows

- f$.db.find(exp) - exp can be free text rel:_key  parent:_key, key:_key


- add and set functions provided in the library should always be used, as they mantain the index coherent with data during such operations, for example removing the words index reference that are being removed from a document content, automaticaly on update.
- The oneliners link, linkmany, unlink and unlinkmany functions should be used to make use of the n to n relation among documents functionalities.
- The oneliner setparent function should be use to make use of the recursive tree functionalities among documents

- ...

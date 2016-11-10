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

https://cdn.rawgit.com/metaschema/oxyzen/master/index.html - WORKING - some feat miss their example.

And our fully featured gui, metaschema, the best way to use oxyzen.

https://cdn.rawgit.com/metaschema/metaschema/master/app.html - WORK IN PROGRESS!!!!!


# How it works
Beyond ugly but 100% coeherently managed, _key attribute is added to documents during runtime (not stored in the db), in the format collectionname-documentkey - this enables for relations to only require one attribute to reference any document in any collection.

# Recursive treeness and N <-> N relations + relations query.
The oneliners setparent, link, linkmany, unlink and unlinkmany functions should be used to make use of the relations features.

- f$.db.setparent(k1,k2,json)
- f$.db.link(k1,k2,json)
- f$.db.unlink(k1,k2,json)
- f$.db.linkmany(k1,keys,json)
- f$.db.unlinkmany(k1,keys,json)

Searches in relations are provided by the same find function already mentioned for text searches.

- f$.db.find(exp,...) - exp in the format parent:collname-dockey OR rel:collname-dockey OR  key:collname-dockey

# Indexing and searching
Reindexing features help starting with an already existing db :
 
- f$.db.clearmetaschema() - explicitely deletes any data used by the oxyzen library.
- f$.db.scan(nextfn) - using lightweight shallow query via REST, gets a list of the collections present in the database.
- f$.db.reindexcollections(_colls,stepfn,endfn) - reindexes specified collections, if colls is set to false, all scanned collections are reindexed.

The indexes are searched using the find function as follows

- f$.db.find(text,...) - 

The indexes are mantained by pushing, updating and deleting documents using oxyzen functions, instead of directly calling the firebase apis;A small number of getters are implemented for easy coherency with the _key attribute in collname-dockey format

- f$.db.add(collname,doc)
- f$.db.set(doc,,)
- f$.db.del(key)
- f$.db.get(...)
- f$.db.getone(key)
- f$.db.getonce(...)

# Subcollections utility
A small set of functions is provided to easily handle subcollections for documents.

- f$.db._add
- f$.db._set
- f$.db._del
- f$.db._get
- f$.db._getone

# Storage uploads handling
Most easily, the oxygen fs.add and set functions can be used to upload files to firebase storage, their metadata is stored in the file collection as documents and therefore inherits all the other functionalities exposed for documents.

- f$.fs.add(...)
- f$.fs.set(...)


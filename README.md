# Oxyzen

In json's dbs the structure is pretty much free, however,  except for special occasions, I' ve seen the "document collection concept" been preferable, scalable and reusable, sharable also, talking with people.

Many, many, many projects could be covered by a bunch of collections, given firebase's integrated login.
I figured, if i was to use a document collections structure for a project I could as well benefit from the know factors of the data structure.

Given your db follows or can follow a "collectionS of documentS structure", this project is a javascript library meant to use with firebase in web applications. It enables some handy feat, with extreme ease of use:

- Recursive treeeness for all the documents in any collection, by adding the property parent in the format "collname-dockey" in the documents
- N<->N relations with metadata,easy querizable, by adding a rel property that have childs in the format  "collname-dockey"
- Searchable word text index + Hashwords index + Titles index (latter one is todo).
- A subcollection utility.
- Using the same subcollection utility a log of the documents changes is implemented, as well as a versioning for documents.
- Cool: Storage uploads are also stored as documents in a collections, so every other functionality listed above, also applies for storage uploads.

Basic library test form.
https://cdn.rawgit.com/metaschema/oxyzen/master/index.html 

And our fully featured gui, metaschema, the best way to use oxyzen.
https://cdn.rawgit.com/metaschema/metaschema/master/app.html


# How it works

- Ugly but coeherently manageable _key attribut is added to documents during runtime (not stored in the db),  in the format collectionname-documentkey - this enables for example replations to ony require one attribute to reference any document in any collection, or enabled any document in any collection to be the parent of any other.
- A reindex function help starts with an already existing db, it creates a local JSON file that the use have to upload in the database via the firebase console, to enable the use of the index.
- Inserts and Updates functions provided in the library should always be used, as they mantain the index coherent with data during such operations, for example removing the words index reference that are being removed from a document content, automaticaly on update.
- The oneliners link, linkmany, unlink and unlinkmany functions should be used to make use of the n to n relation among documents functionalities.
- The oneliner setparent function should be use to make use of the recursive tree functionalities among documents
- The oneliner find function should be used to find documents using on of the following: free words, rel:_key, parent:_key, key:_key
- ...

# Usage / refs draft
-1 Have a firebase project with some data that follows the collections of documents structure.

-2 In a webpage with the firebase script and connected to that db, use 

f$.db.reindexcollections:function(colls,stepfn,endfn), where colls is an array with strings containing the names of the collections you want to reindex, at the end this will give you a JSON data you can download locally and upload in the /_OXY node of your firebase database.

-3 



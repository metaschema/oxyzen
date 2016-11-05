# oxyzen
-Basic library test form
https://cdn.rawgit.com/metaschema/oxyzen/master/index.html 

-And our fully featured gui, metaschema < link here >

In json's dbs the structure is pretty much free, however,  except for special occasions, I' ve seen the "document collection concept" been preferable, scalable and reusable, sharable also.

Most of the projects for the micro and the small business could be covered by a bunch of collections, given firebase's integrated login.
I figured, if i was to use a document collections structure for a project I could as well benefit from the know factors of the data structure.

This project allows for easy administration of such a database, and on use it adds recursive treeeness for all the documents in any collection, and n to n relations with metadata, plus a searchable textual index, plus a subcollection utility, and using the same subcollection utility a log of the documents changes is implemented, as well as a version memory for document.

I know the answer on the forum about this suggests the use of elastic search via the use of some other server, but i found micro and small projects could not benefit from such an aggravation in the complexity of the structure - and manteinance.
Especially when this experimental indexing function works so well.
I plan to greatly improove the ways of the current indexing, but still, after testin with a db of about 100000 interinked documents in 5 collections, I found our indexing functions, holding, and the overall output performance seems much greater than pure .net xml web services against beefed mysql server. Of course with small limitations; limitations that i find great to ensure our apps have a linear time of execution.
But I guess a function for returning the keys would not break that, instead, could greatly improove the performances in many scenarios.

# how it works
-1 Ugly but coeherently manageable _key attribut is added to documents during runtime (not stored in the db),  in the format collectionname-documentkey - this enables for example replations to ony require one attribute to reference any document in any collection, or enabled any document in any collection to be the parent of any other.

-2 A reindex function help starts with an already existing db, it creates a local JSON file that the use have to upload in the database via the firebase console, to enable the use of the index.

-3 Inserts and Updates functions provided in the library should always be used, as they mantain the index coherent with data during such operations, for example removing the words index reference that are being removed from a document content, automaticaly on update.

-4 The oneliners link, linkmany, unlink and unlinkmany functions should be used to make use of the n to n relation among documents functionalities.

-5 The oneliner setparent function should be use to make use of the recursive tree functionalities among documents

-6 The oneliner find function should be used to find documents using on of the following: free words, rel:_key, parent:_key, key:_key

-7 ...

# usage / refs draft
-1 Have a firebase project with some data that follows the collections of documents structure.

-2 In a webpage with the firebase script and connected to that db, use 

f$.db.reindexcollections:function(colls,stepfn,endfn), where colls is an array with strings containing the names of the collections you want to reindex, at the end this will give you a JSON data you can download locally and upload in the /_OXY node of your firebase database.

-3 



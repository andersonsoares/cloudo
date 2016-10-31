import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import PouchDB from 'pouchdb';

/*
  Generated class for the Todos provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class Todos {
 
  data: any;
  db: any;
  remote: any;
 
  constructor(public http: Http) {
 
    this.db = new PouchDB('cloudo');
 
    this.remote = 'http://192.168.1.102:5984/cloudo';
 
    let options = {
      live: true,
      retry: true,
      continuous: true
    };
 
    this.db.sync(this.remote, options)
      .on('change', function (info) {
        // handle change
        console.log('[PouchDB] change: ' + info)
      }
      ).on('paused', function (err) {
        // replication paused (e.g. replication up to date, user went offline)
        console.log('[PouchDB] Paused: ' + err)
      }).on('active', function () {
        // replicate resumed (e.g. new changes replicating, user went back online)
        console.log('[PouchDB] Active')
      }).on('denied', function (err) {
        // a document failed to replicate (e.g. due to permissions)
        console.log('[PouchDB] Denied: ' + err)
      }).on('complete', function (info) {
        // handle complete
        console.log('[PouchDB] Complete: ' + info)
      }).on('error', function (err) {
        // handle error
        console.log('[PouchDB] Erro: ' + err)
      });
 
  }
 
  getTodos() {
 
  if (this.data) {
    return Promise.resolve(this.data);
  }
 
  return new Promise(resolve => {
 
    this.db.allDocs({
 
      include_docs: true
 
    }).then((result) => {
 
      this.data = [];
 
      let docs = result.rows.map((row) => {
        this.data.push(row.doc);
      });
 
      resolve(this.data);
 
      this.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
        this.handleChange(change);
      });
 
    }).catch((error) => {
 
      console.log(error);
 
    }); 
 
  });
 
}
 
  createTodo(todo){
  this.db.post(todo);
}
 
updateTodo(todo){
  this.db.put(todo).catch((err) => {
    console.log(err);
  });
}
 
deleteTodo(todo){
  this.db.remove(todo).catch((err) => {
    console.log(err);
  });
}
 
  handleChange(change){
 
  let changedDoc = null;
  let changedIndex = null;
 
  this.data.forEach((doc, index) => {
 
    if(doc._id === change.id){
      changedDoc = doc;
      changedIndex = index;
    }
 
  });
 
  //A document was deleted
  if(change.deleted){
    this.data.splice(changedIndex, 1);
  } 
  else {
 
    //A document was updated
    if(changedDoc){
      this.data[changedIndex] = change.doc;
    } 
 
    //A document was added
    else {
      this.data.push(change.doc); 
    }
 
  }
 
}
 
}

import fs from 'fs';
import path from 'path';
import lodash from 'lodash';




function storyPagination(posts, options){

  // apply post counter
  posts.forEach((o,i)=>{
    o.postCounter = i;
  })

  // post navigation
  posts.forEach((o,i)=>{
    o.postOlder = (o.postCounter-1<0?(posts.length-1):o.postCounter-1);
    o.postNewer = (o.postCounter+1>(posts.length-1)?0:o.postCounter+1);
    o.postFirst = i===0?true:false;
    o.postLast = i===(posts.length-1)?true:false;
  })

  // page navigation
  const pages = lodash.chunk(posts, options.limit)
  pages.forEach((p,j)=>{
    p.forEach((o,i)=>{
      o.pageCounter = j;
    })
  })

  posts.forEach((o,i)=>{
    o.pageNewer = (o.pageCounter+1>(pages.length-1)?0:o.pageCounter+1);
    o.pageOlder = (o.pageCounter-1<0?(pages.length-1):o.pageCounter-1);
    o.pageFirst = o.pageCounter===0?true:false;
    o.pageLast = o.pageCounter===(pages.length-1)?true:false;
  })

  return {posts, pages};
}
function latestPagination(posts, options){

  // apply post counter
  posts.forEach((o,i)=>{
    o.postCounter = ((posts.length-1) -i);
  })

  // post navigation
  posts.forEach((o,i)=>{
    o.postOlder = (o.postCounter-1<0?(posts.length-1):o.postCounter-1);
    o.postNewer = (o.postCounter+1>(posts.length-1)?0:o.postCounter+1);
    o.postFirst = i===0?true:false;
    o.postLast = i===(posts.length-1)?true:false;
  })

  // page navigation
  const pages = lodash.chunk(posts, options.limit)
  pages.forEach((p,j)=>{
    p.forEach((o,i)=>{
      o.pageCounter = ((pages.length-1) -j);
    })
  })

  posts.forEach((o,i)=>{
    o.pageNewer = (o.pageCounter+1>(pages.length-1)?0:o.pageCounter+1);
    o.pageOlder = (o.pageCounter-1<0?(pages.length-1):o.pageCounter-1);
    o.pageFirst = o.pageCounter===(pages.length-1)?true:false;
    o.pageLast = o.pageCounter===0?true:false;
  })

  return {posts, pages};
}

function storySort(listOfBooks, options){
  const posts = lodash.cloneDeep(listOfBooks).map(book=>book.data).flat();
  return storyPagination(posts, options);
}

function latestSort(listOfBooks, options){
  //const posts = listOfBooks.map(book=>book.order=='story'?book.data:[].concat(book.data).reverse()).flat();
  const posts = lodash.cloneDeep(listOfBooks).map(book=>[].concat(book.data).reverse()).flat();

  return latestPagination(posts, options);
}

function upgradeEntries(listOfBooks){
  listOfBooks.forEach(book=>{
    book.data.forEach(entry=>{
        entry.bookName = book.name;
        entry.bookTitle = book.title;
        entry.html = entry.data.html;
        entry.text = entry.data.text;
        entry.text = lodash.truncate(entry.text, {
        'length': 512,
        'separator': /,? +/
        });
    })
  })


  listOfBooks.filter(i=>i.name == 'westland-warrior').forEach(book=>{
    book.data.forEach(entry=>{
      entry.date = (new Date()).toISOString();
      console.log(entry);
    })
  })
}

function load(files, options){

  let listOfBooks = files
  .map(name => path.join(path.resolve(options.sourceDatabasePath), name))
  .map(location => fs.readFileSync(location).toString())
  .map(string => JSON.parse(string))
  .flat();

  upgradeEntries(listOfBooks);


  // TODO: SORTING
  return {
    story: storySort(listOfBooks, options),
    latest: latestSort(listOfBooks, options),
  }



}




function loadMeta(options){

    // const response = {
    //   meta:{
    //     books:[]
    //   }
    // };

    const books = fs.readdirSync(path.resolve(options.sourceDatabasePath), { withFileTypes: true })
    .filter(fileObject => fileObject.isFile())
    .map(fileObject => fileObject.name)
    .filter(name => name.endsWith(options.extension))
    .sort()
    .map(name => {
      const string = fs.readFileSync( path.join(path.resolve(options.sourceDatabasePath), name) ).toString()
      const object = JSON.parse(string);
      delete object.data;
      return object;
    })

    // files.forEach((file)=>{
    //   response.meta.books.push({
    //     id:path.basename(file, path.extname(file)),
    //     name:lodash.startCase(path.basename(file, path.extname(file))),
    //   })
    // })
    return {
      meta:{books}
    };
}

function loadEach(options){

    const response = {};
    const files = fs.readdirSync(path.resolve(options.sourceDatabasePath), { withFileTypes: true })
    .filter(fileObject => fileObject.isFile())
    .map(fileObject => fileObject.name)
    .filter(name => name.endsWith(options.extension))
    .sort();

    files.forEach((file)=>{
      response[path.basename(file, path.extname(file))] = load([file], options);
    })

    return response;

}
function loadAll(options){

    const response = {};

    const files = fs.readdirSync(path.resolve(options.sourceDatabasePath), { withFileTypes: true })
    .filter(fileObject => fileObject.isFile())
    .map(fileObject => fileObject.name)
    .filter(name => name.endsWith(options.extension))
    .sort();

    response.all = load(files, options);
    console.log(response.all);

    return response;

}



export default function(options){

  const response = {
    ...loadMeta(options),
    ...loadAll(options),
    ...loadEach(options),
  };

  console.log(response);

  return response;

}

#!/usr/bin/env -S node --experimental-modules

import fs from 'fs';
import path from 'path';

import lodash from 'lodash';
import truncate from 'lodash/truncate.js';
import pct from 'calculate-percent';


import Koa from 'koa';

import koaRouter from '@koa/router';
import koaBody from 'koa-body';
import serve from 'koa-static';
import logger from 'koa-logger';

import render from './lib/render.mjs';

async function main(){

const app = new Koa();
app.use(serve('static'));


const router = koaRouter();

// "database"
const options = {
  sourceDatabasePath: 'posts',
  extension: '.json',
}

const posts = fs.readdirSync(path.resolve(options.sourceDatabasePath), { withFileTypes: true })
.filter(fileObject => fileObject.isFile())
.map(fileObject => fileObject.name)
.filter(name => name.endsWith(options.extension))
.sort()
.reverse()
.map(name => fs.readFileSync( path.join(path.resolve(options.sourceDatabasePath), name) ).toString() )
.map( string => JSON.parse(string) )
.flat()
.map(data=>{

  data.html = data.data.html;
  data.text = data.data.text;
  data.text = truncate(data.text, {
  'length': 512,
  'separator': /,? +/
  });

  return data;
});

posts.forEach((o,i)=>{
  o.counter = i+1;
})



// middleware

app.use(logger());

app.use(render);

app.use(koaBody());

// route definitions

router
  .get('/', index)
  .get('/browse/:page', index)
  .get('/read/:id', read)

  .get('/post/new', add)
  .get('/post/:id', show)

  .post('/post', create);

app.use(router.routes());

/**
 * Post listing.
 */


async function index(ctx) {

  const limit = 10;
  const page = parseInt(ctx.params.page)||0;
  const pages = Math.floor((posts.length)/limit);
  const prev = page-1;
  const next = page+1;


  await ctx.render('index', {
    pagination: {
      prev: prev<0?pages:prev,
      next: next>pages?0:next,
      first: prev<0?true:false,
      second: page>1?true:false,
      last: next>pages?true:false,
    },

    posts: lodash([].concat(posts).reverse()).drop(page * limit).take(limit).reverse().value(), //.orderBy(['title'], ['asc'])
  });
}





async function read(ctx) {
  const id = ctx.params.id;

  const post = lodash.find(posts, ['id', id]);
  if (!post) ctx.throw(404, 'invalid post id');

  // const index = lodash.findIndex(posts, ['id', id]);
  // const count = posts.length - 1; // must be zero based
  //
  // const previousNumber = index-1; // WARNING: out of bounds is allowed
  // const nextNumber = index+1; // WARNING: out of bounds is allowed
  //
  // const first = previousNumber<0?true:false;
  // const last = nextNumber>count?true:false;
  //
  // const previousIndex = first?count:previousNumber;
  // const nextIndex = last?0:nextNumber;
  //
  // const prev = posts[previousIndex].id;
  // const next = posts[nextIndex].id;
  // const curr = post.id;






  const index = lodash.findIndex(posts, ['id', id]);
  const count = posts.length;

  const previousNumber = index-1;
  const nextNumber = index+1;

  const first = previousNumber<0?true:false;
  const last = nextNumber>count-1?true:false;

  const previousIndex = first?count-1:previousNumber;
  const nextIndex = last?0:nextNumber;

  const prev = posts[previousIndex].id;
  const next = posts[nextIndex].id;
  const curr = post.id;

  const total = count;
  const partial = index+1;
  const percent = pct(partial, total)

  await ctx.render('read', {
    pagination: {
      prev,
      next,
      curr,
      first,
      last,

      partial,
      total,
      percent,

    },
    post,
  });
}






async function readByIndex(ctx) {
  const count = posts.length;
  const index = ctx.params.index;
  const post = posts[index];
  if (!post) ctx.throw(404, 'invalid post id');

  const previousNumber = index-1;
  const nextNumber = index+1;

  const first = previousNumber<0?true:false;
  const last = nextNumber>count-1?true:false;

  const previousIndex = first?count-1:previousNumber;
  const nextIndex = last?0:nextNumber;

  const prev = previousIndex
  const next = nextIndex
  const curr = post.id;

  const total = count;
  const partial = index+1;
  const percent = pct(partial, total)

  await ctx.render('read', {
    pagination: {
      prev,
      next,
      curr,
      first,
      last,

      partial,
      total,
      percent,

    },
    post,
  });
}








async function list(ctx) {
  ctx.state.now = new Date();
  ctx.state.ip = ctx.ip;
  ctx.state.version = '2.0.0';
  await ctx.render('list', {
    posts,
  });
}

/**
 * Show creation form.
 */

async function add(ctx) {
  await ctx.render('new');
}

/**
 * Show post :id.
 */

async function show(ctx) {
  const id = ctx.params.id;
  const post = posts[id];
  if (!post) ctx.throw(404, 'invalid post id');
  await ctx.render('show', { post });
}

/**
 * Create a post.
 */

async function create(ctx) {
  const post = ctx.request.body;
  const id = posts.push(post) - 1;
  post.created_at = new Date();
  post.id = id;
  ctx.redirect('/');
}

// listen
app.listen(3000);

}

main();

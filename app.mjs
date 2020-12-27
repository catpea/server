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
.map(name => fs.readFileSync( path.join(path.resolve(options.sourceDatabasePath), name) ).toString() )
.map( string => JSON.parse(string).reverse() )
.flat()
.map(data=>{
  data.html = data.data.html;
  data.text = data.data.text;
  data.text = truncate(data.text, {
  'length': 512,
  'separator': /,? +/
  });
  return data;
})

posts.forEach((o,i)=>{
  o.counter = (posts.length-i);
})

posts.forEach((o,i)=>{
  o.forward = (i-1<0?posts.length:i-1);
  o.backward = (i+1>posts.length?0:i+1);
})




// middleware

app.use(logger());

app.use(render);

app.use(koaBody());

// route definitions

router
  .get('/', index)
  .get('/browse/:page', index)
  .get('/read/:counter', read)

  .get('/list', list)

  .get('/post/:id', show)

  .post('/post', create);

app.use(router.routes());

/**
 * Post listing.
 */


async function index(ctx) {
  // [].concat(posts).reverse()
  const limit = 10;
  const pages = Math.floor((posts.length)/limit);
  const page = ctx.params.page?(parseInt(ctx.params.page)-1):pages;

  const prev = page-1;
  const next = page+1;


  const sliced = lodash([].concat(posts).reverse()).drop(page * limit).take(limit).value(); //.orderBy(['title'], ['asc'])
  const flipped = [].concat(sliced).reverse();

  await ctx.render('index', {
    pagination: {

      prev: (prev<0?pages:prev)+1,
      next: (next>pages?0:next)+1,

      first: page==1?true:false,
      last: page==pages?true:false,
      second: page==(pages-2)?true:false,
    },
    // [].concat(posts).reverse()
    posts: flipped
  });
}










async function read(ctx) {
  const size = posts.length;
  const index = parseInt(ctx.params.counter)-1;
  const post = posts[index];
  if (!post) ctx.throw(404, 'invalid post id');
  const previousNumber = index-1;
  const nextNumber = index+1;

  await ctx.render('read', {
    pagination: {
      index,
      size,
      prev: ((previousNumber<0)?size-1:previousNumber)+1,
      next: ((nextNumber>size-1)?0:nextNumber)+1,
      first: previousNumber<0?true:false,
      last: nextNumber>size-1?true:false,
      percent: pct(index+1, size),

    },
    post,
  });
}








async function list(ctx) {
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

#!/usr/bin/env -S node --experimental-modules

import fs from 'fs';
import path from 'path';

import lodash from 'lodash';
import pct from 'calculate-percent';


import Koa from 'koa';

import koaRouter from '@koa/router';
import koaBody from 'koa-body';
import serve from 'koa-static';
import logger from 'koa-logger';

import render from './lib/render.mjs';
import datasource from './lib/datasource.mjs';

async function main(){

const app = new Koa();

app.use(async (ctx,next) => {


  ctx.state.title = 'Cat Pea University';
  ctx.state.description = 'We offer the latest in teaching, learning, and research. Our aim is to inspire students to knowledge, wisdom, and greatness for the betterment of Human Kind.';


  await next();
});

app.use(serve('static'));


const router = koaRouter();



// "database"
const options = {
  debug: true,
  sourceDatabasePath: 'posts',
  extension: '.json',
  limit: 6,
}

const data = datasource(options);



// middleware

app.use(logger());

app.use(render);

app.use(koaBody());

// route definitions

router
  .get('/', index)

  .get('/book/:name/:order/read/:counter', book)
  .get('/book/:name/:order/page/:page', book)
  .get('/book/:name/:order', book)





  .get('/browse/:page', index)
  .get('/read/:name/:counter', read)

  .get('/list', list)

  //.get('/post/:id', show)

  //.post('/post', create);

app.use(router.routes());

/**
 * Post listing.
 */


async function index(ctx) {

  const {pages, posts} = data.all.latest;

  const pageNumber = ctx.params.page?(parseInt(ctx.params.page)):(pages.length-1);
  const selected = lodash.filter(posts, { pageCounter:pageNumber });

  await ctx.render('index', {

    pageName:        ctx.state.title,
    pageDescription: ctx.state.description,

    pagination: lodash.last(selected),
    books: data.meta.books,
    posts: selected
  });

}


async function book(ctx) {

  const meta = data.meta.books.filter(o=>o.name === ctx.params.name).pop();
  const order = ctx.params.order?ctx.params.order:meta.order;
  const {pages, posts} = data[ctx.params.name][order];
  const pageNumber = ctx.params.page?(parseInt(ctx.params.page)):(order=='story'?0:(pages.length-1))
  const selected = lodash.filter(posts, { pageCounter:pageNumber });

  await ctx.render('book', {

    bookName:        meta.name,
    pageName:        `${meta.title}: ${meta.subtitle}`,
    pageDescription: `${meta.description}`,
    currentSort:      order,
    defaultSort:      meta.order, // default

    pagination: lodash.last(selected),
    books: data.meta.books,
    posts: selected
  });

}










async function read(ctx) {

  const meta = data.meta.books.filter(o=>o.name === ctx.params.name).pop();
  const order = ctx.params.order?ctx.params.order:meta.order;
  const {pages, posts} = data[ctx.params.name][order];
  const post = lodash.find(posts, function(o) { return o.counter == parseInt(ctx.params.counter) });

  if (!post) ctx.throw(404, 'invalid post id');

  await ctx.render('read', {
    pageName: post.title,
    pageDescription: `${meta.title}: ${meta.description}`,

    books: data.meta.books,
    post,
  });
}








async function list(ctx) {
  await ctx.render('list', {
    posts: data.all.posts,
  });
}
//
//
//
// /**
//  * Show creation form.
//  */
//
// async function add(ctx) {
//   await ctx.render('new');
// }
//
// /**
//  * Show post :id.
//  */
//
// async function show(ctx) {
//   const id = ctx.params.id;
//   const post = posts[id];
//   if (!post) ctx.throw(404, 'invalid post id');
//   await ctx.render('show', { post });
// }
//
// /**
//  * Create a post.
//  */
//
// async function create(ctx) {
//   const post = ctx.request.body;
//   const id = posts.push(post) - 1;
//   post.created_at = new Date();
//   post.id = id;
//   ctx.redirect('/');
// }

// listen
app.listen(3000);

}

main();

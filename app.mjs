#!/usr/bin/env -S node --experimental-modules

import render from './lib/render.mjs';
import logger from 'koa-logger';
import koaRouter from '@koa/router';
import koaBody from 'koa-body';
import serve from 'koa-static';

import Koa from 'koa';

const app = new Koa();
app.use(serve('static'));


const router = koaRouter();

// "database"

const posts = [];

// middleware

app.use(logger());

app.use(render);

app.use(koaBody());

// route definitions

router.get('/', list)
  .get('/post/new', add)
  .get('/post/:id', show)
  .post('/post', create);

app.use(router.routes());

/**
 * Post listing.
 */

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

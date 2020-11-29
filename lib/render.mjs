import views from 'koa-views';
import path from 'path';

// setup views mapping .html
// to the swig template engine

export default views(path.join('views'), {
  map: { html: 'ejs' },
});

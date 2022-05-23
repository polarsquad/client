# Gettig started

Clone the repository and run ```npm install```.

Then run ```npm run build -- default```

(The default theme is configured to run with an existing backend, 
that may or may not be online at the time you try this. Best use your own backend;
see https://github.com/InfoCompass/backend)

This will build the default theme into the dev folder. 
Serve the files from this folder with your favourite web server.
In order for things to work properly you have to configure your web server
such that everything that is not an asset
is redirected to index.html (that's an old angularJs thing):

``` apache
	# If the requested resource doesn't exist, use index.html
    RewriteRule ^ /index.html
```


You can try all the other themes from https://github.com/orgs/InfoCompass/repositories 
if you like, they're configured to use their
respective backends and should work out of the box. To do that, pull on of the
custom-* repositories into /custom; for example:

```
$ cd custom
$ git pull https://github.com/InfoCompass/custom-pa.git
$ cd ..
$ npm run build -- pa dist
```

This should build the theme into build/dist. Notice the second parameter from the
build script (here 'dist'): If it is present the theme will be build into the respective
sub folder of /build; if not, it will go to dev.




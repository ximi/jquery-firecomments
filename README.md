# jQuery FireComments #

## Add a commenting system powered by Firebase to any page ##

### What is jQuery FireComments? ###
This is the alpha release of jQuery FireComments, a [jQuery](http://jquery.com/) plugin that let's you add a simple commenting system to any page without the need for your own backend by using [Firebase](https://www.firebase.com/) to store the comment data.

### Why should I use this? ###
 * Because you want to let users comment on a static website without a backend or a system that doesn't have a built-in commenting system
 * Because you don't want to rely on third party commenting systems such as Facebook Comments, disqus, IntenseDebate (Even though your comments are hosted on Firebase, you are the one that controls the data. It is similar to store them in any hosted sql database.)
 * Because you want comments to show up on your page in real time to encourage conversations

### How do I use it? ###
 1. Sign up for a free [Firebase Account](https://www.firebase.com/signup/). Their free plan should suffice for all smaller websites (around 70000 monthly pageviews according to Firebase). If you have a website with a large amount of traffic you will need to sign up for one of their paid plans.
 2. Add security rules to your Firebase. If you aren't going to modify the default url structure (as defined by the parent_path/child_path options) you can use the rules from the firebase_security_rules_example.json or adjust them according to your needs.
 3. Include jquery, firebase and firecomments on your page
         <script src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>
         <script src="https://cdn.firebase.com/v0/firebase.js"></script>
         <script src="jquery.firecomments.js"></script>
 4. Call jQuery FireComments on the element you want the comments to appear in with your firebase url:
        $("#element").fireComments({
            firebase_url: 'https://sizzling-fire-1457.firebaseio.com/'
        });

### Options ###

#### firebase_url ####
Default: undefined
Type: url-escaped string
This is the only option that is required. It's the url to your firebase. If you run into any problems with Firebase, check out their excellent [docs](https://www.firebase.com/docs/web-quickstart.html)

#### id ####
Default: '1'
Type: url-escaped string
This uniquely identifies the page you are adding and retrieving comments for. If you are only ever going to add comments to a single page you do not need to provide it. If you want to add FireComments to several pages, you'll need to pass a unique, url-escaped value into each

#### parent_path ####
Default: 'posts'
Type: url-escaped string
This is the parent container individual pages (identified by the id) are stored under in your Firebase.

#### child_path ####
Default: 'comments'
Type: url-escaped string
This is the container your comments are stored under in your Firebase. This is useful if you also store additional information about your pages/posts in the same firebase.

#### new_desc ####
Default: true
Type: boolean
Setting this value to true will order comments from newest to oldest. Setting it to false will show the oldest comment first and the newest last

#### comments_container ####
Default: '<section id="fire-comments"></section>'
Type: html string | jQuery object
This is the html container comments will be added to. It can be a jQuery object that references an existing element on the page, a new jQuery object or a string representing the desired html.

#### form ####
Default: '<form id="fire-comment-form"></form>',
Type: html string | jQuery object
This is the form element the comment form will be added to. It can be a jQuery object that references an existing element on the page, a new jQuery object or a string representing the desired html.

If you are passing an existing form that already contains input elements, FireComments presumes you are providing the comment inputs and no longer generates them. In that case make sure that the inputs have the right ids (`fire-comment-name`, `fire-comment-website`, `fire-comment-content`).

#### form_before ####
Default: true
Type: boolean
If set to true the generated form will be added before the comments, if set to false after. If you are providing your own form, this option is ignored.

#### renderComment ####
Default: undefined
Type: function
Arguments: snapshot
This let's you render comments yourself. This is called whenever a new comment is added. The snapshot argument has 3 properties, name, website and content. You can either return a html string or directly manipulate the dom yourself and return false/nothing.

#### renderForm ####
Default: undefined
Type: function
This let's you render the comment form yourself. You can either return a html string or directly manipulate the dom yourself and return false/nothing.

#### renderFormGroup ####
Default: undefined
Type: function
Arguments: label, slug, type, required
This let's you render the form inputs and its related html yourself. You can either return a html string or directly manipulate the dom yourself and return false/nothing.

### Plans for the Future ###
#### Short Term ####
 * Add the ability to define custom fields
 * Basic spam proteciton
 * Ability to edit/delete comment while still on page
 * Better, more detailed readme/docs
 * much, much more...

#### Long Term ####
 * Ability to remember user (prefill fields, delete/edit old comments)
 * Better way to customize html structure (basic templating system)
 * jQuery independent version
 * much, much more
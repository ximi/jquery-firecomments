;(function($, window, document, undefined) {
    'use strict';

    // Set up our defaults
    var defaults = {
            id: '1',
            parent_path: 'posts',
            child_path: 'comments',
            new_desc: true,
            comments_container: '<section id="fire-comments"></section>',
            form: '<form id="fire-comment-form"></form>',
            form_before: true
        },
        utilities = {
            trimSlashes: function(string) {
                string = string.replace(/^\/+/, '');
                string = string.replace(/\/+$/, '');
                return string;
            },
            nl2br: function(str) {
                return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br />' + '$2');
            },
            stripHtml: function(html) {
                return $('<div></div>').html(html).text();
            },
            isInDom: function(element) {
                return $.contains(document.documentElement, $(element)[0]);
            }
        };

    function FireComments (element, options) {
        this.element = element;
        this.$element = $(element);
        this.settings = $.extend({}, defaults, options);
        this._defaults = defaults;
        this._name = 'firecomments';
        this.init();
    }

    FireComments.prototype = {
        init: function() {
            // store a reference to our comment container
            this.$comments_container = $(this.settings.comments_container);
            // if it isn't in the dom already, append it to the element
            if(!utilities.isInDom(this.$comments_container)) {
                this.$comments_container.appendTo(this.$element);
            }

            // store a reference to our form
            this.$form = $(this.settings.form);
            // if the form isn't already in the dom, let's add it
            if(!utilities.isInDom(this.$form)) {
                var method = this.settings.form_before ? 'prependTo' : 'appendTo';
                this.$form[method](this.$element);
            }

            // let's render our form
            this.renderForm();

            // connect to Firebase
            this.connect();

            // setup our events
            this.setupEvents();
        },
        connect: function() {
            // make sure we have a firebase url
            if(typeof this.settings.firebase_url === 'undefined') {
                throw new Error('No Firebase URL has been passed to fireComments');
            }
            else {
                // let's connect
                this.updateUrl();
                try {
                    this.firebase = new Firebase(this.url);
                }
                catch (e) {
                    throw new Error('The following error occured while connecting to Firebase: ' +  e.message);
                }
            }
        },
        updateUrl: function() {
            this.url = this.settings.firebase_url +
                     (this.settings.parent_path ? '/' + utilities.trimSlashes(this.settings.parent_path) : '') +
                     (this.settings.id ? '/' + this.settings.id : '') +
                     (this.settings.child_path ? '/' + utilities.trimSlashes(this.settings.child_path) : '') +
                     '/';
        },
        setupEvents: function() {
            if(this.firebase) {
                var that = this;
                this.firebase.on('child_added', function(snapshot) {
                    that.renderComment(snapshot);
                });
                this.$form.on('submit', function(e) {
                    // prevent the form from actually submitting
                    e.preventDefault();
                    that.saveComment();
                });
            }
        },
        renderComment: function(snapshot) {
            if(snapshot) {
                var comment = snapshot.val(),
                    rendered_comment;

                if($.isFunction(this.settings.renderComment)) {
                    rendered_comment = this.settings.renderComment.apply(this.element, [comment]);
                }
                else {
                    var comment_html = '<article class="fire-comment">';
                    comment_html += '<div class="fire-comment-meta">';
                    if(comment.website) {
                        comment_html += '<a href="' + comment.website + '" class="fire-commenter">' + comment.name + '</a>';
                    }
                    else {
                        comment_html += '<span class="fire-commenter">' + comment.name + '</a>';
                    }
                    comment_html += '</div>';
                    comment_html += '<div class="fire-comment-content">';
                    comment_html += comment.content;
                    comment_html += '</div>';
                    comment_html += '</article>';

                    rendered_comment = comment_html;
                }

                if(typeof rendered_comment !== 'undefined') {
                    var method = this.settings.new_desc ? 'prepend' : 'append';
                    this.$comments_container[method](rendered_comment);
                }
            }
        },
        renderForm: function() {
            // use custom function for rendering the form if it has been passed as option
            var rendered_form;
            if($.isFunction(this.settings.renderForm)) {
                rendered_form = this.settings.renderForm.apply(this.element);
            }
            else {
                // check if our form is empty, if not we're presuming the comment fields are already present
                if(!this.$form.find('input, textarea').length) {
                    var form_html = this.renderFormGroup('Name', 'name', 'text');
                    form_html += this.renderFormGroup('Website', 'website', 'url');
                    form_html += this.renderFormGroup('Comment', 'content', 'textarea', true);
                    form_html += '<input type="submit" value="Submit" />';
                    rendered_form = form_html;
                }
            }

            /*
             * it's possible for the custom function not to return any value
             * as the user has directly manipulated the dom
             * or that the form fields already exists
             * in either case we won't touch the dom anymore
             */
            if(typeof rendered_form !== 'undefined') {
                this.$form.html(rendered_form);
            }
        },
        renderFormGroup: function(label, slug, type, required) {
            var rendered_form_group;

            // use custom function for rendering form groups if it has been passed as option
            if($.isFunction(this.settings.renderFormGroup)) {
                rendered_form_group = this.settings.renderFormGroup.apply(this.element, [label, slug, type, required]);
            }
            else {
                var form_group_html = '<div class="fire-comment-form-group">';
                form_group_html += '<label class="fire-comment-form-label" for="fire-comment-' + slug + '">' + label + '</label>';
                if(type === 'textarea') {
                    form_group_html += '<textarea';
                }
                else {
                    form_group_html += '<input type="' + type + '"';
                }
                form_group_html += ' name="fire-comment-' + slug + '" id="fire-comment-' + slug + '"';
                if(required) {
                    form_group_html += ' required="required"';
                }
                if(type === 'textarea') {
                    form_group_html += '></textarea>';
                }
                else {
                    form_group_html += ' />';
                }
                form_group_html += '</div>';
                rendered_form_group = form_group_html;
            }

            /*
             * it's possible for the custom function not to return any value
             * as the user has directly manipulated the dom
             * in which case we won't return a value either
             */
            if(typeof rendered_form_group !== 'undefined') {
                return rendered_form_group;
            }
        },
        saveComment: function() {
            var comment_name = this.$form.find('#fire-comment-name').val(),
                comment_website = this.$form.find('#fire-comment-website').val(),
                comment_content = this.$form.find('#fire-comment-content').val();

            // Some light data sanitation
            comment_name = $.trim(utilities.stripHtml(comment_name));
            comment_website = $.trim(utilities.stripHtml(comment_website));
            comment_content = $.trim(utilities.nl2br(utilities.stripHtml(comment_content)));

            this.firebase.push({
                name: comment_name,
                website: comment_website,
                content: comment_content
            });
        }
    };

    $.fn.fireComments = function(options) {
        this.each(function() {
            if(!$.data(this, 'firecomments')) {
                $.data(this, 'firecomments', new FireComments(this, options));
            }
        });
        return this;
    };
})(jQuery, window, document);
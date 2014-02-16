(function() {

  return {
    events: {
      'app.activated':'init',
      'getUser.done':'fetchComments',
      'getComments.done':'renderComments',
      'click .comment':'onCommentClick',
      'click .done_editing':'onDoneEditingClick',
      'click .select_section':'onPostClick',
      'click .back_to_comments':function(event) {
        this.ajax('getComments');
      }
    },
    requests: {
      getUser: function() {
        return {
          url: '/api/v2/users/me.json',
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      },
      getComments: function() {
        return {
          url: helpers.fmt('/api/v2/tickets/%@/comments.json?sort_order=desc&include=users',this.ticket().id()),
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      },
      getSections: function(html) {
        return {
          url: '/api/v2/help_center/sections.json?include=categories,translations',
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      },
      postArticle: function (article, section) {
        return {
          url: helpers.fmt('/api/v2/help_center/sections/%@/articles.json',section),
          type: 'POST',
          dataType: 'JSON',
          contentType: 'application/JSON',
          proxy_v2: true,
          data: article
        };
      }
    },
    init: function() {
      this.ajax('getUser');
    },
    fetchComments: function(data) {
      var currentUser = data.user;
      if (currentUser.moderator === true) {
      this.ajax('getComments');
      } else {
        //check for unrestricted sections and continue if true, if not show a message
      }
    },
    renderComments: function(data) {
      var comments = data.comments,
          users = data.users;
      //_.each(comments, function(comment) {
      //});
      this.switchTo('comments', {
        comments: comments,
        users: users
      });
    },
    onCommentClick: function(data) {
      //get available sections, and when that finishes switch to the show_comment template with the comment and sections
      var id = data.currentTarget.id,
          innerHtml = data.currentTarget.innerHTML.trim();
          comment = innerHtml.slice(0, - 29);
      this.switchTo('show_comment', {
          comment: comment
      });
    },
    onDoneEditingClick: function () {
      this.ajax('getSections')
      .done(function(response){
        var sections = response.sections,
            categories = response.categories,
            translations = response.translations;
        _.each(categories, function(category) {
          category.sections = new Array();
          //add category titles to categories
          category.translations = new Array();
          _.each(category.translation_ids, function(id) {
            var translation = _.find(translations, function(obj) {
              return obj.id == id;
            });
            category.translations.push(translation);
            console.log("Category translations: " + translation.title);
          });
        });
        _.each(sections, function(section) {
          //add translation titles to sections
          section.translations = new Array();
          _.each(section.translation_ids, function(id) {
            var translation = _.find(translations, function(obj) {
              return obj.id == id;
            });
            section.translations.push(translation);
            //console.log("Section translations: " + section.translations);
          });
          //add sections to categories
          var category = _.find(categories, function(obj) {
            return obj.id == section.category_id;
          });
          category.sections.push(section);
          console.log(category.sections);
        });
        this.switchTo('article_options', {
          categories: categories
        });
      });
    },
    onPostClick: function() {
      var html = this.$('textarea.show_comment').text(),
          draft = true,
          promoted = false,
          comments_disabled = false,
          locale = 'en-us',
          title = 'Title',
          article = helpers.fmt(
            '{"article": {"draft": %@, "promoted": %@, "comments_disabled": %@, "translations": [{"locale": "%@", "title": "%@", "body": "%@"}]}}',
            draft,promoted,comments_disabled,locale,title,html),
          section = this.$('select.section').val();
      this.ajax('postArticle', article, section);
    }
  };
}());

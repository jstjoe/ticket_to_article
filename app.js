(function() {

  return {
    events: {
      'app.activated':'init',
      'getUser.done':'getComments',
      'getComments.done':'renderComments',
      'click .comment':'onCommentClick',
      'click .post_article':'onPostClick',
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
    getComments: function(data) {
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
          html = innerHtml.slice(0, - 29);
      this.switchTo('show_comment', {
        comment: html
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
          section = 48465;
      this.ajax('postArticle', article, section);
    }
  };
}());

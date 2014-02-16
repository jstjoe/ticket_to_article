(function() {

  return {
    events: {
      'app.activated':'init',
      'getComments.done':'renderComments'
    },
    requests: {
      getComments: function() {
        return {
          url: helpers.fmt('/api/v2/tickets/%@/comments.json',this.ticket().id()),
          dataType: 'JSON',
          type: 'GET',
          proxy_v2: true
        };
      },
    },
    init: function() {
      this.getComments();
    },
    getComments: function(id) {
      this.ajax('getComments', id);
    },
    renderComments: function(data) {
      var comments = data.comments;
      console.log(comments);
    }
  };
}());

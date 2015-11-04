Shortly.Links = Backbone.Collection.extend({
  model: Shortly.Link,
  url: '/links',
  initialize: function () {
    //collection.fetch automaticall does a get request to /links url
    // this.fetch();
  }
});

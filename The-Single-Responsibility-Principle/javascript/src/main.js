require.config({
    baseUrl: "/js",
    paths: {
        jquery: "lib/jquery-2.1.1", 
        underscore: "lib/underscore", 
        backbone: "lib/backbone",
        "backbone-relational": "lib/backbone-relational",
        mustache: "lib/mustache",
        jasmine: "lib/jasmine"
    }
});

require(["jquery", "backbone", "underscore"], function ($, Backbone, _) {
    // Dependencies are loaded...
    // Execute code
});
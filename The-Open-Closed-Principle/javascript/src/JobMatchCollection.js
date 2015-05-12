define(function(require) {
    "use strict";
   
    var Backbone = require("Backbone");
    var Job = require("Job");
    var Role = require("Role");
    
    var JobMatchCollection = Backbone.Collection.extend({
        model: function(data) {
            if (data.type === "jobRepresentation") {
                return new Job(data);
            } else if (data.type === "roleRepresentation") {
                return new Role(data);
            }
        },
            
        parse: function(data) {
            if (data) {
                return data.opportunityRepresentations;    
            }            
            return null;
        }       
    });

    return JobMatchCollection;                                                       
});

define(function(require) {

    var $ = require("jquery");
    var Backbone = require("Backbone");

    /*
        Sample JSON representation used for this model:
        {
            "title": "Junior Software Engineer",
            "viewed": "false",
            "applied": "false",
            "compensation": "",
            "compensation-estimate": "250000",
        }
     */

    var Job = Backbone.Model.extend({
        shouldShowApplyButton: function() {
            return !Boolean(this.get("applied"));
        },
        actualCompensation: this.get("compensation"),
        estimatedCompensation: this.get("compensation-estimate"),
        hasBeenViewed: function() {
            return $("[data-js=viewed]").val() === "Already Viewed";
        }
    });

    return Job;
});
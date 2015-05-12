define(function(require) {

    var Marionette = require("Marionette");
    var jobItemTemplate = require("text!static/templates/job-item-template.html");

    var JobItemView = Marionette.ItemView.extend({
        template: jobItemTemplate,
        events: {
            "click [data-js=job-description]": this.markJobViewed,
            "click [data-js=apply]": this.markJobApplied()
        },
        templateHelpers: {
            shouldShowApplyButton: this.model.shouldShowApplyButton(),
            actualCompensation: this.determineCompensation(),
            hasBeenViewed: this.model.hasBeenViewed()
        },
        determineCompensation: function() {
            if (this.model.actualCompensation() === "") {
                return this.model.estimatedCompensation();
            } else {
                return this.model.actualCompensation();
            }
        },
        markJobViewed: function() {
            this.model.set("viewed", true);
            $("[data-js=viewed]").val("Already Viewed");
        },
        markJobApplied: function() {
            this.model.set("applied", true);
        }
    });

    return JobItemView;
});


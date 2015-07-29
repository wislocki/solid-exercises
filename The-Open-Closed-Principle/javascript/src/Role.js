define(function(require) {
    "use strict";

    var Enumerables = require("modules/application/Enumerables");
    var BaseModel = require("modules/base/BaseModel");

    var Recruiter = require("modules/recruiter/Recruiter");
    var RoleInteraction = require("modules/role/RoleInteraction");

    var _ = require("Underscore");

    var Role = BaseModel.extend({

        idAttribute: "roleId",
        urlRoot: "/api/roles",

        generalKeywords: function() {
            return this.get("keywords").general || [];
        },

        companyKeywords: function() {
            return this.get("keywords").companies || [];
        },

        roleId: function() {
            return this.get("id");
        },

        title: function() {
            return this.get("title");
        },

        locations: function() {
            return this.get("locations") || [];
        },

        industry: function() {
            return Enumerables.industryNames[this.get("industryId")];
        },

        disciplines: function() {
            return _.map(this.get("disciplineIds"), function(disciplineId) {
                return Enumerables.disciplineNames[disciplineId];
            });
        },

        recruiter: function() {
            return new Recruiter({
                "recruiter": this.get("recruiter")
            });
        },

        recruitersFirstName: function() {
            if (this.get("recruiter").firstName.length === 0) {
                return "the recruiter";
            }
            return this.get("recruiter").firstName;
        },

        jobseekerSaidLiked: function() {
            return !this.has("links");
        },

        like: function() {
            return $.ajax({
                url: this.likeRoleLink(),
                type: 'POST'
            });
        },

        likeRoleLink: function() {
            return this.getUriByAction("like");
        },

        likedDate: function() {
            return this.getNested("like.date");
        },

        greatestInteractionDate: function() {
            return this.getNested("action.date");
        },

        postingDate: function() {
            return new Date(this.get("postingDate"));
        },

        isExpired: function() {
            return !this.get("status").isActive;
        },

        isLiked: function() {
            return this.has("like");
        },

        interaction: function() {
            if (this.hasNoInteraction()) {
                return RoleInteraction.none();
            }
            return new RoleInteraction(this.get("action"));
        },

        hasNoInteraction: function() {
            return !this.has("action");
        },

        canJobseekerLike: function() {
            return this.hasLink("LIKE");
        },

        shouldShowRecruiter: function() {
            return this.recruiter().isVisible();
        },

        getJobseekersRemoveLink: function() {
            return this.getUriByAction("removeLike");
        },

        removeFromTrack: function() {
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: this.getJobseekersRemoveLink(),
                data: JSON.stringify({
                    roleId: this.get("roleId")
                })
            });
        },

        canBeRemoved: function() {
            return this.hasLink("removeLike");
        }
    });

    return Role;
});

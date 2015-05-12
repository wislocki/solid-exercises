define(function(require) {
    "use strict";

    var _ = require("Underscore");
    var _s = require("underscore.string");
    var BaseModel = require("modules/base/BaseModel");
    var RecordDidNotApply = require("modules/apply/RecordDidNotApply");
    var Interaction = require("modules/job/Interaction");
    var JobEvents = require("modules/job/JobEvents");
    var URL = require("modules/util/URL");
    var Recruiter = require("modules/recruiter/Recruiter");
    var JobApplicants = require("modules/scout/JobApplicants");

    function equalsIgnoreCase(expected, actual) {
        if (typeof actual != "string") {
            return false;
        }

        return expected.toLowerCase() == actual.toLowerCase();
    }

    var Job = BaseModel.extend({

        idAttribute: "jobLocationId",

        urlRoot: "/api/jobs",
        justApplied: false,

        initialize: function() {
            _.bindAll(this, "refresh");
        },

        jobPaywallUrl: function() {
            return this.getUriByAction("relevant-jobs");
        },

        isApplicable: function() {
            return this.hasLink("apply");
        },

        status: function() {
            return this.get("jobStatus");
        },

        inactiveReasonIs: function(reason) {
            var status = this.status();
            if (status) {
                return equalsIgnoreCase(reason, status.inactiveReason);
            }
            return false;
        },

        isExpired: function() {
            return this.inactiveReasonIs("expired");
        },

        isFilled: function() {
            return this.inactiveReasonIs("filled");
        },

        isRemoved: function() {
            return this.inactiveReasonIs("deleted");
        },

        isPending: function() {
            return this.inactiveReasonIs("pending") || this.inactiveReasonIs("pending_reapproval");
        },

        isRejected: function() {
            return this.inactiveReasonIs("rejected");
        },

        isCancelled: function() {
            return this.inactiveReasonIs("cancelled");
        },

        isInactive: function() {
            return !equalsIgnoreCase("active", this.status());
        },

        isInactiveBecauseOfLocation: function() {
            return this.isInactive() && this.inactiveReasonIs("inactive_location");
        },

        isOfccp: function() {
            return this.get("isOfccp");
        },

        isSavedAndNotApplied: function() {
            return this.greatestInteraction().isSaved();
        },

        hasReasonUserCantApply: function() {
            return this.isExpired() || this.isFilled() || this.isRemoved() || this.isPending() || this.isInactiveBecauseOfLocation();
        },

        hasExternalApplyProcess: function() {
            return this.has("externalApplication");
        },

        hasSpecialties: function() {
            var segment = this.get("segment");

            return segment && segment.specialties && segment.specialties.length > 0;
        },

        hasCompensation: function() {
            var compensation = this.get("compensation");

            return compensation && (compensation.bonus || compensation.other || compensation.salary || compensation.total);
        },

        totalCompensation: function() {
            return this.getNested("compensation.total");
        },

        hasReportsTo: function() {
            return !_s.isBlank(this.get("reportsTo"));
        },

        hasYearsExperience: function() {
            return !_s.isBlank(this.get("yearsExperience"));
        },

        hasLastInteraction: function() {
            return this.greatestInteraction().isMeaningful();
        },

        isAppliedTo: function() {
            return this.greatestInteraction().isAppliedTo();
        },

        isLiked: function() {
            return this.greatestInteraction().isLiked();
        },

        hasApplicants: function() {
            return this.applicantCount() >= 0;
        },

        isNotAppliedTo: function() {
            return !this.isAppliedTo();
        },

        hasDownloadedResume: function() {
            return this.getNested("recruiterActivity.resumeDownloaded");
        },

        hasSharedResume: function() {
            return this.getNested("recruiterActivity.resumeShared");
        },

        hasSavedProfile: function() {
            return this.getNested("recruiterActivity.profileSaved");
        },

        profileViewedDate: function() {
            return this.getNested("recruiterActivity.profileViewed");
        },

        lastRecruiterActivityDate: function() {
            return this.getNested("recruiterActivity.lastActivityTime");
        },

        hasOtherLocations: function() {
            return this.has("otherLocations") && this.get("otherLocations").length;
        },

        getDidNotApplyLink: function() {
            if (!this.hasLink("didNotApply")) {
                return null;
            }

            return this.getUriByAction("didNotApply");
        },

        greatestInteraction: function() {
            var interactions = this.get("interactions");
            if (interactions) {
                return new Interaction(interactions.greatest);
            }
            return Interaction.none();
        },

        recordDidNotApply: function() {
            var jobId = this.id;
            return RecordDidNotApply.to(this).then(function() {
                JobEvents.publishDidntApplyFor(jobId);
            });
        },

        getApplicantsLink: function() {
            if (!this.hasLink("jobApplicants")) {
                return null;
            }

            return this.getUriByAction("jobApplicants");
        },

        getPostedDate: function() {
            return this.get("postingDate");
        },

        postingDate: function() {
            return this.get("postingDate");
        },

        greatestInteractionDate: function() {
            return this.greatestInteraction().date();
        },

        canJobseekerApply: function() {
            return this.hasLink('APPLY');
        },

        canJobseekerSave: function() {
            return this.hasLink('SAVE');
        },

        getJobseekersSaveLink: function() {
            var canSave = this.canJobseekerSave();
            return canSave ? this.getUriByAction("SAVE") : null;
        },

        getJobseekersRemoveLink: function() {
            return this.getUriByAction("REMOVE");
        },

        isAFit: function() {
            return this.get("processedApplication").fitnessRating === "FIT";
        },

        saveJob: function() {
            var job = this;
            var saveJob = new BaseModel();
            saveJob.url = this.getJobseekersSaveLink();
            saveJob.save({
                'jobLocationId': this.get("jobLocationId")
            }).then(function() {
                JobEvents.publishSaveFor(job.id);
            });
        },

        jobLocationId: function() {
            if (this.get("location")) {
                return this.getNested("location.id");
            }
            else {
                return this.get("jobLocationId");
            }
        },

        getTitle: function() {
            return this.get("title");
        },

        getCompanyName: function() {
            return this.getNested("company.name");
        },

        getLocationName: function() {
            return this.getNested("location.text");
        },

        getShortDescription: function() {
            return this.get("shortDescription");
        },

        getFullDescription: function() {
            return this.get("fullDescription");
        },

        getYearsExperienceName: function() {
            return this.getNested("yearsExperience.name");
        },

        getCompanySizeDescription: function() {
            return this.getNested("company.size.description");
        },

        getCompensation: function() {
            return this.get("compensation");
        },

        getHiringIndustryName: function() {
            return this.getNested("company.industry.name");
        },

        getFunctions: function() {
            return this.getNested("segment.publishedJobFunctions");
        },

        getSpecialties: function() {
            return this.getNested("segment.specialties");
        },

        applicantCount: function() {
            return this.getNested("jobActivity.applicantCount");
        },

        refresh: function() {
            return this.fetch({
                url: this.getUriByAction("refresh")
            });
        },

        publishView: function() {
            JobEvents.publishViewFor(this.id);
        },

        publishApply: function() {
            JobEvents.publishApplyFor(this.id);
        },

        shouldShowRecruiter: function() {
            return this.has("source") && this.get("source").shouldShowRecruiter === true;
        },

        shouldHideRecruiterActivity: function() {
            return this.has("source") && this.get("source").shouldHideRecruiterActivity === true;
        },

        recruiter: function() {
            return new Recruiter(this.get("source"));
        },

        justAppliedTo: function() {
            return this.justApplied;
        },

        markAsJustApplied: function() {
            this.justApplied = true;
        },

        hasSecureApplicationUrl: function() {
            var url = this.get("externalApplication").url;
            return URL.isSecureUrl(url);
        },

        isHarvested: function() {
            return this.has("externalApplication");
        },

        isClosed: function() {
            return this.isExpired() || this.isRemoved() || this.isInactiveBecauseOfLocation() || this.isRejected() || this.isCancelled();
        },

        hasRecruiterActivities: function() {
            return this.has("recruiterActivity");
        },

        asJobSummary: function() {
            return {
                jobLocationId: this.jobLocationId(),
                title: this.getTitle(),
                companyName: this.getCompanyName(),
                location: this.getLocationName(),
                compensation: this.totalCompensation()
            };
        },

        removeTrackedJob: function() {
            return $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: this.getJobseekersRemoveLink(),
                data: JSON.stringify({
                    jobLocationId: this.get("jobLocationId")
                })
            });
        },

        isRemovedTrackedJob: function() {
            return !this.hasLink("REMOVE");
        },

        jobApplicants: function() {
            var jobApplicants = new JobApplicants();
            jobApplicants.url = this.getApplicantsLink();
            return jobApplicants;
        }
    });

    return Job;
});

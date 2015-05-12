function Environment() {
    this.env = {};    
}
Environment.prototype = {
    get: function(key) {
        return this.env[key];
    },
    set: function(key, val) {
        this.env[key] = val;
    },
    getString: function(key) {
        return this.env[key] + "";
    },
    getAdminEmail: function() {
        var user = this.getString("admin");
        var domain = this.getString("domain");

        return (user.length > 0 && domain.length > 0) ? user + "@" + domain : "";
    }
}
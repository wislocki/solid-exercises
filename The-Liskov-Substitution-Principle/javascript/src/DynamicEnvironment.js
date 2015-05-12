function DynamicEnvironment(environment, keys) {
    this.environment = environment;
    this.keys = keys;
    Environment.call(this);     
}
DynamicEnvironment.prototype = _.extend(Object.create(Environment.prototype), {
    get: function(key) {
        var realKey = this.keys[key];
        var value = this.env[realKey != null ? realKey : key];
        if (value == null) {
            return this.environment.get(realKey != null ? realKey : key);
        }
        return value;
    }
});

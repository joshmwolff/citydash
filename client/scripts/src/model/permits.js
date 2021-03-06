define(
    ["backbone", "underscore", "leaflet", "permit", "config", "utils"],
    function(B, _, L, Permit, config, $u) {
        console.log("Creating Permits collection.");

        return B.Collection.extend({
            model: Permit,

            url: config.pzURL,

            comparator: false,

            /*
             * Applies each of the functions in the array fs to the
             * permits in the collection. If any of the functions
             * returns false, the Permit will be updated: its "excluded"
             * attribute will be set to true.
             */
            applyFilters: function(fs) {
                this.each(function(permit) {
                    var excluded = permit.get("excluded"),
                        shouldExclude = !$u.everyPred(fs, permit);

                    // Is the permit already excluded, and should it be?
                    if (excluded !== shouldExclude) {
                        permit.set("excluded", shouldExclude);
                    }
                });
            },

            // A map of string filter names to functions
            activeFilters: {},

            // Reapply all of the active filters.
            refresh: function() {
                this.applyFilters(_.values(this.activeFilters));
            },

            addFilter: function(name, f) {
                this.activeFilters[name] = f;
                this.refresh();
            },

            removeFilter: function(name) {
                delete this.activeFilters[name];
                this.refresh();
            },

            filterByDescription: function(regex) {
                if (regex) {
                    this.addFilter("search", function(permit) {
                        return !!(regex.exec(permit.get("description")));
                    });
                } else {
                    this.removeFilter("search");
                }
            },

            filterByDescriptionString: function(s) {
                var r = s && new RegExp(s.replace(/([?.*\\()[])/g, "\\$1"), "i");
                this.filterByDescription(r);
            },

            filterByRadius: function(refPoint, radius) {
                if (refPoint && radius) {
                    this.addFilter("radius", function(permit) {
                        var location = permit.get("location");

                        return location &&
                            L.latLng(location).distanceTo(refPoint) <= radius;
                    });
                } else {
                    this.removeFilter("radius");
                }
            },

            /*
             * @param {Array} spga
             */
            filterByAuthority: function(spga) {
                if (spga) {
                    this.addFilter("spga", function(permit) {
                        return _.contains(spga, permit.get("spga"));
                    });
                } else {
                    this.removeFilter("spga");
                }
            },

            filterByType: function(type) {
                if (type) {
                    this.addFilter("type", function(permit) {
                        return permit.get("type") == type;
                    });
                } else {
                    this.removeFilter("type");
                }
            }
        });
    });

class APIFeatures {
    /*
     * query is an instance of mongoose Query Object,
     * queryString is from req.query, it's also an object
     */
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1) Filtering
        const queryObj = { ...this.queryString };
        const excludedFields = ["page", "sort", "limit", "field"];
        excludedFields.forEach((el) => delete queryObj[el]); // remove those properties from queryObj

        // 2) Advanced Filtering with mongoDB operators
        const queryString = JSON.stringify(queryObj);
        const newQueryString = queryString.replace(
            /\b(gte|gt|lt|lte)\b/g, // \b(AWORD)\b means only match AWORD as a word, not part of word
            (match) => `$${match}` // mongoDB operator
        );

        const newQueryObj = JSON.parse(newQueryString);
        console.log("newQueryObj", newQueryObj);

        // build QUERY instance: query
        this.query = this.query.find(newQueryObj); // this return a Query object

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ");
            console.log("sortBy: ", sortBy);
            this.query = this.query.sort(sortBy);
            // If a string is passed, it must be a space delimited list of path names.
            // The sort order of each path is ascending unless the path name is prefixed with - which will be treated as descending.
        } else {
            this.query = this.query.sort("-createdAt");
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields); // query.select('name duration price') select only those fields in array to query
        } else {
            this.query = this.query.select("-__v -createdIAddedAt"); // - means excluding
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1; // a trick to convert to Number
        const limit = this.queryString.limit * 1 || 100; // limit items per page
        const skip = (page - 1) * limit;
        // page=2&limit=10 1-10 page 1, 11-20 page 2, ...
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures
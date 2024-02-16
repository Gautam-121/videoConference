class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    filter() {

        console.log("data from 9" , this.queryStr)
      const queryCopy = { ...this.queryStr };

      console.log("query copy is" , queryCopy)

      if(!queryCopy.startDate && !queryCopy.endDate ){
        console.log("Enter")
        return this
      }

    // Removing some fields for category
      const removeFields = [ "page", "limit"];
  
      removeFields.forEach((key) => delete queryCopy[key]);
  
      // Filter For Dates

      queryCopy = {
        scheduledDate: {
            [Op.between]: [queryCopy.startDate + 'T00:00:00.000Z', queryCopy.endDate + 'T00:00:00.000Z']
        }
      }

    //   let queryStr = JSON.stringify(queryCopy);
    //   queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
  
      this.query = this.query.find(queryCopy);
  
      return this;
    }
  
    // pagination(resultPerPage) {
    //   const currentPage = Number(this.queryStr.page) || 1;
  
    //   const skip = resultPerPage * (currentPage - 1);
  
    //   this.query = this.query.limit(resultPerPage).skip(skip);
  
    //   return this;
    // }
  }
  
  module.exports = ApiFeatures;
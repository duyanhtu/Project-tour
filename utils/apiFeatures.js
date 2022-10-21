class APIfeatures {
    constructor(query, queryString){
        this.query= query;
        this.queryString= queryString;
    }
    filter(){
        const queryObj = {...this.queryString};
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);
        
        // 1B) Advanced Filtering
        let queryStr = JSON.stringify(queryObj);
        // "\b" chỉ lấy đúng những từ trong req: gte, gt, lte, lt
        // "g" là sẽ thay thế nhiều lần và ngược lại
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        
        // Cách lọc nâng cao gte, lte
        // Cách viết thường: { difficulty: 'easy', duration: { $gte: 5 } }     
        // { difficulty: 'easy', duration: { gte :'5'} }
        // gte, gt, lte, lt
        this.query.find(JSON.parse(queryStr));
        return this;
    }
// Nếu viết sort=duration&sort=price => thì nó sẽ trả về 1 mảng ['duration','price'] 
//nhưng vẫn sẽ báo lỗi nên cần dùng hpp
    sort(){
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            console.log(sortBy);
            this.query = this.query.sort(sortBy);
        }else{
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }
    limitFields(){
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v');
        }
        return this;
    }

    pageinate(){
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page -1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}
module.exports = APIfeatures;
const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
//bcrypt dùng để hash (băm mã code)
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        // maxlength: [40, 'A tour name must have less or equal then 40 characters'],
        // minlenght: [10, 'A tour name must have more or equal then 10 characters'],
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    photo: {
        type: String,
        default:
            'https://firebasestorage.googleapis.com/v0/b/natours-220f9.appspot.com/o/users%2Fdefault.jpg?alt=media&token=a4d98ad5-1070-43ab-b4d5-12025e90680d',
    },
    role:{
        type: String,
        enum: ['user', 'guide', 'admin', 'lead-guide'],
        default: 'user'        
    },
    name_photo: {
        type: String,
        default: 'default',
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        //select: false là để loại bỏ password khi hiển thị
        select: false
    }, 
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your passwords'],
        validate: {
            validator: function(el) {
                return el === this.password
            },
            message: 'Passwords are not the same'
        } 
    },
    passwordChangeAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true, 
        select: false
    }
});


userSchema.pre('save',async function(next){
    //Chỉ chạy hàm này nếu password bị thay đổi không thì next() tới trung gian
    if(!this.isModified('password')) return next();
    
    //bcrypt.hash để mã hóa this.password thành một chuỗi bất kì
    this.password =await bcrypt.hash(this.password, 12);

    // Xóa password để không bị mắc lỗi ERROR
    this.passwordConfirm = undefined;
    next();
});
userSchema.pre('save', function (next) {
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordChangeAt = Date.now() - 1000;
    next();
});


userSchema.pre(/^find/, function (next) {
    // chỉ lấy những user có active : true 
    // Lưu ý nếu chỉ ghi mỗi {active: true} -> nó sẽ xóa tất cả những active: false + những người chưa có active
    // Nên phải ghi là {active: {$ne: fasle}}
    this.find({active : {$ne: false}});
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword){
    //Trong đó candidatePassword là mk đã được tạo từ signin
    //Trong đó userPassword là mk người dùng nhập để đăng nhập
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    let changeTimeAfter
    if(this.passwordChangeAt){
        changeTimeAfter = parseInt(this.passwordChangeAt.getTime()/1000, 10);
    }
    //Sai có nghĩa là không thay đổi 
    return JWTTimestamp < changeTimeAfter;
}

userSchema.methods.createPasswordResetToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
}
// Luôn luôn phải chuyển đổi từ BlogSechma thành mô hình Model để có thể làm việc được
const User = mongoose.model('User', userSchema);

module.exports = User;
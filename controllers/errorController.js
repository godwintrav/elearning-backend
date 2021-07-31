

//handle errors
module.exports.handleAuthErrors = (err) => {
    //console.log(err.message, err.code);
    let errors = {firstName: '', lastName: '', email: '', password: '', address: '', phone: '', instructorType: '', userType: '', course: '', degree: '', trainingLicence: '', incorporationCertificate: '', companyName: ''};

    //unverified email
    if(err.message === "unverified email"){
        errors.email = "Please verify your email address";
    }

    //incorrect login
    if(err.message === "incorrect login"){
        errors.password = "Incorrect email or password";
    }

    //invalid course
    if(err.message === "required course"){
        errors.course = "Course is required";
    }

    //invalid degree
    if(err.message === "required degree"){
        errors.degree = "Degree is required";
    }

    //invalid userType
    if(err.message === "invalid userType"){
        errors.userType = "Invalid user type passed";
    }

    //required companyName
    if(err.message === "required companyName"){
        errors.companyName = "Company name is required for Corporate body";
    }

    //required incorporationCertificate
    if(err.message === "required incorporationCertificate"){
        errors.incorporationCertificate = "Incorporation Certificate is required for Corporate body";
    }

    //required trainingLicence
    if(err.message === "required trainingLicence"){
        errors.trainingLicence = "Training Licence is required for Corporate body";
    }

    //required expertise
    if(err.message === "required expertise"){
        errors.expertise = "Expertise is required";
    }

    //required experience
    if(err.message === "required experience"){
        errors.experience = "Experience is required";
    }

    //required cv
    if(err.message === "required cv"){
        errors.cv = "CV is required";
    }

    //invalid instructorType
    if(err.message === "invalid instructorType"){
        errors.instructorType = "Invalid Instructor type";
    }

    //duplicate error codes
    if(err.code == 11000){
        errors.email = "Email has already been registered";
        return errors;
    }

    //validation errors
    if(err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({ properties }) => {
            //console.log(properties);
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

module.exports.handleCourseErrors = (err) => {
    //console.log(err.message, err.code);
    let errors = {user: '', title: '', whatYouLearn: '', requirement: '', description: '', secondTitle: '', thumbnail: '', category: ''};

    //validation errors
    if(err.message.includes('course validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            //console.log(properties);
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

module.exports.handlePlaylistErrors = (err) => {
    //console.log(err.message, err.code);
    let errors = {course: '', name: ''};

    //validation errors
    if(err.message.includes('playlist validation failed')){
        Object.values(err.errors).forEach(({properties}) => {
            //console.log(properties);
            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

module.exports.checkStudentErrors = (request) => {
    if(!request.body.degree){
        throw Error('required degree');
    }

    if(!request.body.course){
        throw Error('required course');
    }

    return true;
}

module.exports.checkIndividualErrors = (request) => {
    if(!request.body.expertise){
        throw Error('required expertise');
    }

    if(!request.body.experience){
        throw Error('required experience');
    }

    if(!request.files['cv']){
        throw Error('required cv');
    }

    return true;
}

module.exports.checkCorporateErrors = (request) => {
    if(!request.body.companyName){
        throw Error('required companyName');
    }

    if(!request.files['incorporationCertificate']){
        throw Error('required incorporationCertificate');
    }

    if(!request.files['trainingLicence']){
        throw Error('required trainingLicence');
    }

    return true;
}

module.exports.checkLectureErrors = (request) => {
    if(!request.body.playlistId){
        throw Error('required playlistID');
    }

    if(!request.body.title){
        throw Error('required title');
    }

    if(!request.file){
        throw Error('required video');
    }
}

module.exports.handleCreateLectureErrors = (err) => {
    //console.log(err.message);
    let errors = {playlist: '', description: '', title: '', video: ''};
    //required playlistID
    if(err.message === 'required playlistID'){
        errors.playlist = "playlistID is required";
    }

    //required title
    if(err.message === 'required title'){
        errors.title = "Title is required";
    }

    //required video
    if(err.message === 'required video'){
        errors.video = "Video upload is required";
    }

    //error vimeo
    if(err.message === "error vimeo"){
        errors.video = "Error uploading video try again.";
    }

    return errors;
}

// module.exports = {
//     handleErrors,
//     checkCorporateErrors,
//     checkIndividualErrors,
//     checkStudentErrors
// }
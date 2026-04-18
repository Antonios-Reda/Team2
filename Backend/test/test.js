const app = require('../app');
const request = require('supertest')(app);
const logger = require('../logger');

let token = '';
let id = 0;


// Signup Doctor
describe('\n\n\n\nSignup ::', () => {

    it('Create User Success\n\n', (done) => {
        request
            .post('/api/users/signup')
            .send({
                firstname: 'firstname',
                lastname: 'lastname',
                email: 'doctor@gmail.com',
                password: 'password',
                role: 'Doctor',
                specialization: 'Dermatologist'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                if (res.body.success === 0) {
                    logger.error(res.body);
                    return done(new Error("Signup failed"));
                }

                console.log(res.body);
                logger.info(res.body);
                done();
            });
    });


    it('Failed to signup \n\n', (done) => {
        request
            .post('/api/users/signup')
            .send({
                firstname: 'firstname',
                lastname: 'lastname',
                email: 'doctor@gmail.com',
                password: 'password',
                role: 'Doctor',
                specialization: 'Dermatologist'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                if (res.body.success === 1) {
                    return done(new Error("Should have failed"));
                }

                console.log(res.body);
                logger.info(res.body);
                done();
            });
    });

});


// Login Doctor
describe('\n\n\n\nLogin test :: ', () => {

    it('should not able log in \n\n', (done) => {
        request
            .post('/api/users/login')
            .send({
                email: 'wrong@gmail.com',
                password: 'wrong',
                role: 'Patient'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                if (res.body.success === 1) {
                    return done(new Error("Should fail login"));
                }

                console.log(res.body);
                logger.info(res.body);
                done();
            });
    });


    it('should be able to login \n\n', (done) => {
        request
            .post('/api/users/login')
            .send({
                email: 'doctor@gmail.com',
                password: 'password',
                role: 'Doctor'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                if (res.body.success === 0) {
                    return done(new Error("Login failed"));
                }

                console.log(res.body);
                logger.info(res.body);

                token = res.body.currentUser.token;
                id = res.body.currentUser.id;

                done();
            });
    });

});


// Delete Doctor
describe('\n\n\n\nDelete User ::', () => {

    it('Delete User Success\n\n', (done) => {
        request
            .delete('/api/users/doctor')
            .set('Authorization', `Bearer ${token}`)
            .send({
                id: id,
                role: 'Doctor'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                if (res.body.success === 0) {
                    return done(new Error("Delete failed"));
                }

                console.log(res.body);
                logger.info(res.body);
                done();
            });
    });

});


// Signup Patient
describe('\n\n\n\nSignup Patient ::', () => {

    it('Create Patient Success\n\n', (done) => {
        request
            .post('/api/users/signup')
            .send({
                firstname: 'firstname',
                lastname: 'lastname',
                email: 'patient@gmail.com',
                password: 'password',
                role: 'Patient'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                console.log(res.body);
                logger.info(res.body);
                done();
            });
    });

});


// Login Patient
describe('\n\n\n\nLogin Patient :: ', () => {

    it('Patient login success \n\n', (done) => {
        request
            .post('/api/users/login')
            .send({
                email: 'patient@gmail.com',
                password: 'password',
                role: 'Patient'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                console.log(res.body);
                logger.info(res.body);

                token = res.body.currentUser.token;
                id = res.body.currentUser.id;

                done();
            });
    });

});


// Delete Patient
describe('\n\n\n\nDelete Patient ::', () => {

    it('Delete Patient Success\n\n', (done) => {
        request
            .delete('/api/users/doctor')
            .set('Authorization', `Bearer ${token}`)
            .send({
                id: id,
                role: 'Patient'
            })
            .end((err, res) => {
                if (err) return done(err);
                if (!res || !res.body) return done(new Error("No response"));

                console.log(res.body);
                logger.info(res.body);
                done();
            });
    });

});

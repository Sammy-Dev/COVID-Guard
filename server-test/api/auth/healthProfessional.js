process.env.NODE_ENV = 'testing';

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../../../server");
const USER_TYPE = require("../../../server/_constants/usertypes");
const {createMockHealthProfessionalUsers} = require("../../../server/utils/mockData");
const assert = require('chai').assert
const bcrypt = require('bcryptjs');
const HealthProfessionalUser = require("../../../server/models/HealthProfessional");
const sinon = require("sinon");
const sgMail = require('@sendgrid/mail');

// Configure chai
chai.use(chaiHttp);

describe("Covid App Server API Health Professional Auth", () => {
    describe("POST /api/healthprofessional/auth/login", () => {
        it("returns error message 'Please enter all fields'", (done) => {
            chai.request(app)
                .post('/api/healthprofessional/auth/login')
                .end((err, res) => {
                    if (res.status === 500) throw new Error(res.body.message);
                    if (err) throw new Error(err);
                    assert.equal(res.status, 400);
                    assert.propertyVal(res.body, 'errCode', 400);
                    assert.propertyVal(res.body, 'success', false);
                    assert.propertyVal(res.body, 'message', 'Please enter all fields');
                    done();
                });
        });
        it("it returns message 'User does not exist'", (done) => {
            chai.request(app)
                .post('/api/healthprofessional/auth/login')
                .send({"email": "test@test.com", "password": "pass"})
                .end((err, res) => {
                    if (res.status === 500) throw new Error(res.body.message);
                    if (err) throw new Error(err);
                    assert.equal(res.status, 400);
                    assert.propertyVal(res.body, 'errCode', 400);
                    assert.propertyVal(res.body, 'success', false);
                    assert.propertyVal(res.body, 'message', 'User does not exist');
                    done();
                });
        });
        it("it allows successful login", (done) => {
            createMockHealthProfessionalUsers(true).then((users) => {
                let user = users[0];
                chai.request(app)
                    .post('/api/healthprofessional/auth/login')
                    .send({"email": user.email, "password": user.rawPassword})
                    .end((err, res) => {
                        if (res.status === 500) throw new Error(res.body.message);
                        if (err) throw new Error(err);
                        assert.equal(res.status, 200);
                        assert.propertyVal(res.body, 'success', true);
                        assert.propertyVal(res.body, 'userId', user.id);
                        assert.propertyVal(res.body, 'type', USER_TYPE.HEALTH);
                        assert.property(res.body, 'token');
                        // implement this later
                        // assert.propertyVal(res.body, 'token', '');
                        done();
                    });
            });
        });
        it("it allows successful temporary login", (done) => {
            createMockHealthProfessionalUsers(true).then(async (users) => {
                let user = users[0];
                user.setTemporaryPassword();
                const savedUser = await user.save();
                chai.request(app)
                    .post('/api/healthprofessional/auth/login')
                    .send({"email": savedUser.email, "password": savedUser.passwordReset.temporaryPassword})
                    .end((err, res) => {
                        if (res.status === 500) throw new Error(res.body.message);
                        if (err) throw new Error(err);
                        assert.equal(res.status, 200);
                        assert.propertyVal(res.body, 'success', true);
                        assert.propertyVal(res.body, 'userId', savedUser.id);
                        assert.propertyVal(res.body, 'type', USER_TYPE.HEALTH);
                        assert.propertyVal(res.body, 'isTemporary', true);
                        assert.property(res.body, 'token');
                        // implement this later
                        // assert.propertyVal(res.body, 'token', '');
                        done();
                    });
            });
        });
    });
    describe("POST /api/healthprofessional/auth/register", () => {
        it("returns error message 'Please enter all fields'", (done) => {
            chai.request(app)
                .post('/api/healthprofessional/auth/register')
                .end((err, res) => {
                    if (res.status === 500) throw new Error(res.body.message);
                    if (err) throw new Error(err);
                    assert.equal(res.status, 400);
                    assert.propertyVal(res.body, 'errCode', 400);
                    assert.propertyVal(res.body, 'success', false);
                    assert.propertyVal(res.body, 'message', 'Please enter all fields');
                    done();
                });
        });
        it("Registers new health professional user", (done) => {
            chai.request(app)
                .post('/api/healthprofessional/auth/register')
                .send({
                    "email": "test2@email.com",
                    "password": "testPassword2",
                    "firstName": "Johnny",
                    "lastName": "Smithy",
                    "phone": "0498709723",
                    "healthID": "5656565656565656"
                })
                .end((err, res) => {
                    if (res.status === 500) throw new Error(res.body.message);
                    if (err) throw new Error(err);
                    assert.equal(res.status, 200);
                    assert.propertyVal(res.body, 'success', true);
                    assert.propertyVal(res.body, 'type', USER_TYPE.HEALTH);
                    HealthProfessionalUser.findOne({email: "test2@email.com"}).select("+password").then((user) => {
                        assert.propertyVal(res.body, 'userId', user.id);
                        assert.property(res.body, 'token');
                        assert.propertyVal(user, 'firstName', "Johnny");
                        assert.propertyVal(user, 'lastName', "Smithy");
                        assert.propertyVal(user, 'phone', "0498709723");
                        //assert.isTrue(user.comparePassword("testPassword2"));
                        done();
                    });
                });
        });
    });
    describe("POST /api/healthprofessional/auth/changepassword", () => {
        it("returns error message 'Please enter all fields'", (done) => {
            chai.request(app)
                .post('/api/healthprofessional/auth/changepassword')
                .end((err, res) => {
                    if (res.status === 500) throw new Error(res.body.message);
                    if (err) throw new Error(err);
                    assert.equal(res.status, 400);
                    assert.propertyVal(res.body, 'errCode', 400);
                    assert.propertyVal(res.body, 'success', false);
                    assert.propertyVal(res.body, 'message', 'Please enter all fields');
                    done();
                });
        });
        it("returns error message 'Password and confirm password do not match'", (done) => {
            chai.request(app)
                .post('/api/healthprofessional/auth/changepassword')
                .send({
                    "userId": "41224d776a326fb40f000001",
                    "currentPassword": "oldPassword",
                    "newPassword": "newPassword",
                    "confirmPassword": "newPasswordDifferent",
                })
                .end((err, res) => {
                    if (res.status === 500) throw new Error(res.body.message);
                    if (err) throw new Error(err);
                    assert.equal(res.status, 400);
                    assert.propertyVal(res.body, 'errCode', 400);
                    assert.propertyVal(res.body, 'success', false);
                    assert.propertyVal(res.body, 'message', 'Password and confirm password do not match');
                    done();
                });
        });
        it("returns error message 'Current password doesn\'t match'", (done) => {
            createMockHealthProfessionalUsers(true).then((users) => {
                let user = users[0];
                chai.request(app)
                    .post('/api/healthprofessional/auth/changepassword')
                    .send({
                        "userId": user.id,
                        "currentPassword": "oldPassword",
                        "newPassword": "newPassword",
                        "confirmPassword": "newPassword"
                    })
                    .end((err, res) => {
                        if (res.status === 500) throw new Error(res.body.message);
                        if (err) throw new Error(err);
                        assert.equal(res.status, 400);
                        assert.propertyVal(res.body, 'errCode', 400);
                        assert.propertyVal(res.body, 'success', false);
                        assert.propertyVal(res.body, 'message', 'Current password doesn\'t match');
                        done();
                    });
            });
        });
        it("It changes a HealthProfessionalUsers password", (done) => {
            createMockHealthProfessionalUsers(true).then((users) => {
                let user = users[0];
                chai.request(app)
                    .post('/api/healthprofessional/auth/changepassword')
                    .send({
                        "userId": user.id,
                        "currentPassword": user.rawPassword,
                        "newPassword": "newPassword",
                        "confirmPassword": "newPassword"
                    })
                    .end((err, res) => {
                        if (res.status === 500) throw new Error(res.body.message);
                        if (err) throw new Error(err);
                        assert.equal(res.status, 200);
                        assert.propertyVal(res.body, 'success', true);
                        HealthProfessionalUser.findById(user.id).select("+password").then((changedUser) => {
                            assert.propertyVal(res.body, 'userId', user.id);
                            bcrypt.compare("newPassword", changedUser.password).then((v) => {
                                assert.isTrue(v);
                                done();
                            });
                        });
                    });
            });
        });
    });
    describe("POST /api/healthprofessional/auth/forgotpassword", () => {
        it("returns error message 'Please enter all fields'", (done) => {
            chai.request(app)
                .post('/api/healthprofessional/auth/forgotpassword')
                .end((err, res) => {
                    if (res.status === 500) throw new Error(res.body.message);
                    if (err) throw new Error(err);
                    assert.equal(res.status, 400);
                    assert.propertyVal(res.body, 'errCode', 400);
                    assert.propertyVal(res.body, 'success', false);
                    assert.propertyVal(res.body, 'message', 'Please enter all fields');
                    done();
                });
        });
        it("It creates a password reset request", (done) => {
            createMockHealthProfessionalUsers(true).then((users) => {
                let user = users[0];
                // reset the history so that you get the correct call
                global.setApiKeyStub.resetHistory();
                global.sendMailStub.resetHistory();
                chai.request(app)
                    .post('/api/healthprofessional/auth/forgotpassword')
                    .send({userId: user.id})
                    .end((err, res) => {
                        if (res.status === 500) throw new Error(res.body.message);
                        if (err) throw new Error(err);
                        assert.equal(res.status, 200);
                        assert.propertyVal(res.body, 'success', true);
                        assert.isTrue(global.setApiKeyStub.called);
                        assert.isTrue(global.sendMailStub.called);
                        HealthProfessionalUser.findById(user.id).then((changedUser) => {
                            assert.propertyVal(res.body, 'userId', changedUser.id);
                            assert.notEqual(global.sendMailStub.getCall(0).args[0]["html"].indexOf(changedUser.passwordReset.temporaryPassword), -1);
                            assert.property(changedUser.passwordReset, 'temporaryPassword');
                            assert.property(changedUser.passwordReset, 'expiry');
                            done();
                        });
                    });
            });
        });
    })
});
const app = require("./server");
const request = require("supertest").agent(app.listen());
const expect = require("chai").expect;
describe('Create user, add methods and measurements to him', () => {
    it('create new user test', (done) => {
        request
            .post('/register')
            .send({name: 'test', email: 'test@test.test', age: 18, height: 188, password: 'test'})
            .end((err, res) => {
                if (res.text === 'conflict with already existing email address'){
                    expect(res.status).to.eql(409);
                    done();
                }
                else{
                    expect(res.status).to.eql(200);
                    done();
                }

            })
    })
    it('add new method to user test', (done) => {
        request.post('/userID').send({email: 'test@test.test'}).then(rr=>{
            request
                .post('/addMethod')
                .send({name: 'Test', description: 'Test method', userid: rr.body.map(({id}) => id)[0]})
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    done();
                })
        })

    })
    it('add new measurements to user test with method Bicyklovanie', (done) => {
        request.post('/userID').send({email: 'test@test.test'}).then(rr=>{
            request
                .post('/addMeasurement')
                .send({value: '80', method: 'Test', date: '2022-12-4', userid: rr.body.map(({id}) => id)[0]})
                .end((err, res) => {
                    expect(res.status).to.eql(200);
                    done();
                })
        })
    })
})
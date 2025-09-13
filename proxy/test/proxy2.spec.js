
import request from 'supertest';
import {app, server, parseURL, getAuthToken, secretMatchesTarget} from '../src/index'

const appHash = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QiLCJhcHBQZXJtaXNzaW9uIjoxLCJhcHBJRCI6IjY2NGNmZmNlMjBiOTZiMTFlMzliNzcxYSIsImlzcyI6Ik1BVEMiLCJuYW1lIjoiS2xhdXMiLCJpZCI6IjY0NjY4ZmU4NGNkYzE0NDZiYWMxZDEyYiIsImV4cCI6MTcxNjkyNzA1NCwiZW1haWwiOiJrbGF1cy5zY2hhZWZlcnNAZ21haWwuY29tIn0.gf394ibAXIVFH4kfRIK-WmEeGbTqOfWsGKRbOzhcGOU'
beforeAll(() => {
    app.get('/test/static.json',(req,res) => {
        res.send({
            "version": "1.0.0",
            "status": "static",
            "headerAuth": req.headers['authorization'],
            "headerHost": req.headers['x-forwarded-host'],
            "headerHash": req.headers['x-flowrabbit-hash'],
            "headerAppID": req.headers['x-flowrabbit-appid'],
            "headerOther": req.headers['x-flowrabbit-other'],
        })
    })

    app.post('/test/static.json',(req,res) => {
        console.debug(req.body)
        res.send({
            "version": "1.0.0",
            "status": "static",
            "body": req.body,
            "headerAuth": req.headers['authorization'],
            "headerHost": req.headers['x-forwarded-host'],
            "headerHash": req.headers['x-flowrabbit-hash'],
            "headerAppID": req.headers['x-flowrabbit-appid'],
            "headerOther": req.headers['x-flowrabbit-other'],
        })
    })


})

test('Proxy > intercept proxy?/test/static.json', async () => {
    const res = await request(app)
        .get("/proxy")
        .set('x-forwarded-host', "http://localhost:8084/test/static.json");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('static');    
});




afterAll(() => {
    server.close();
});
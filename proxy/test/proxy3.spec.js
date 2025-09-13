
import request from 'supertest';
import {app, server, secretService} from '../src/index'

/**
 * Update this token with a preview one?
 */
const appHash = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiZ3Vlc3QiLCJhcHBQZXJtaXNzaW9uIjoxLCJhcHBJRCI6IjY2NGNmZmNlMjBiOTZiMTFlMzliNzcxYSIsImlzcyI6Ik1BVEMiLCJuYW1lIjoiS2xhdXMiLCJpZCI6IjY0NjY4ZmU4NGNkYzE0NDZiYWMxZDEyYiIsImV4cCI6MTcxODY1Mzc3NywiZW1haWwiOiJrbGF1cy5zY2hhZWZlcnNAZ21haWwuY29tIn0.UzCTbGKIUArLHFIxbONqG29WnSo7EzY07HUjIzJzmDQ'

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


test('Proxy > GET proxy?/test/static.json Custom Header', async () => {

    console.debug('Server,', secretService)
    const res = await request(app)
        .get("/proxy")
        .set('x-forwarded-host', "http://localhost:8084/test/static.json")
        .set('x-flowrabbit-hash',appHash)
        .set('x-flowrabbit-appid', '664cffce20b96b11e39b771a')
        .set('x-flowrabbit-other', 'ABC')
        .set("Authorization", "Bearer ${secrets.flowrabbit}");
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('static');   
    expect(res.body.headerAuth.indexOf('Bearer')).toBe(0);   
    //expect(res.body.headerAuth).not.toBe('Bearer ${secrets.flowrabbit}'); 
    expect(res.body.headerOther).toBe('ABC')  
});



afterAll(() => {
    server.close();
});
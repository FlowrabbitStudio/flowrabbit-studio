
import request from 'supertest';
import {app, server} from '../src/index'

beforeAll(() => {

})

test('ECHO > GET ', async () => {
    const res = await request(app)
        .get("/echo.json?a=1")
        .set("Authorization", "ABC");
    expect(res.statusCode).toBe(200);
    expect(res.body.host).toBe(''); 
    expect(res.body.path).toBe('/echo.json'); 
    expect(res.body.query.a).toBe('1');  
    expect(res.body.headers.authorization).toBe('ABC');  
});

test('ECHO > POST ', async () => {
    const res = await request(app)
        .post("/echo.json?a=1")
        .send({x:1})
        .set("Authorization", "ABC");
    expect(res.statusCode).toBe(200);
    expect(res.body.host).toBe(''); 
    expect(res.body.path).toBe('/echo.json'); 
    expect(res.body.query.a).toBe('1');  
    expect(res.body.headers.authorization).toBe('ABC');  
    expect(res.body.body.x).toBe(1);  
});



afterAll(() => {
    server.close();
});
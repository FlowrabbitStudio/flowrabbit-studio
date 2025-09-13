import {server, parseURL, secretMatchesTarget} from '../src/index'

test('Proxy > parseURL', async () => {
    let url = parseURL('http://localhost:8084/test/static.json')    
    expect(url.host).toBe('http://localhost:8084')
    expect(url.path).toBe('/test/static.json')


    url = parseURL('http://localhost:8084/test/static.json?a=1&b=2')    
    expect(url.host).toBe('http://localhost:8084')
    expect(url.path).toBe('/test/static.json?a=1&b=2')

    url = parseURL('https://api.server:8084/test/static.json?a=1&b=2')    
    expect(url.host).toBe('https://api.server:8084')
    expect(url.path).toBe('/test/static.json?a=1&b=2')
});

test('Proxy > secretMatchesTarget', async () => {

    let isAllowed = secretMatchesTarget({
        value: 'abc'
    }, 'http://whatever')
    expect(isAllowed).toBe(true)


    isAllowed = secretMatchesTarget({
        value: 'abc',
        domain: 'http://myserver.com'
    }, 'http://whatever')
    expect(isAllowed).toBe(false)

    let isAllowed3 = secretMatchesTarget({
        value: 'abc',
        domain: 'http://myserver'
    }, 'http://myserver.com/rest.json')
    expect(isAllowed3).toBe(true)


    let isAllowed4 = secretMatchesTarget({
        value: 'abc',
        domain: 'http://myserver.com'
    }, 'http://myserver.com/rest.json')
    expect(isAllowed4).toBe(true)


    let isAllowed5 = secretMatchesTarget({
        value: 'abc',
        domain: 'http://api.myserver.com'
    }, 'http://myserver.com/rest.json')
    expect(isAllowed5).toBe(false)

})


afterAll(() => {
    server.close();
});

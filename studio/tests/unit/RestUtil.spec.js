import RestUtil from '../../src/core/RestUtil'

test('Test RestUtil >  getAllVariables() > REST OLD', async () => {


    const rest = {
        "method" : "POST",
        "url" : "https://flowrabbit.de/test/users.json?${query}",
        "token" : "",
        "authType" : "Bearer",
        "input" : {
          "type" : "JSON",
          "fileDataBinding" : "",
          "template" : "${template.variable}"
        },
        "output" : {
          "databinding" : "list",
          "template" : "",
          "type" : "JSON",
          "hints" : {
            "API[0]" : "Array",
            "API[0]_id" : "Value",
            "API[0]_email" : "Value",
            "API[0]_name" : "Value",
            "API[0]_lastname" : "Value",
            "API[0]_hasNewsletter" : "Value"
          }
        },
        "headers" : [ ],
        "isProxyEnabled" : true
    }

    const vars = RestUtil.getAllVariables(rest)
    console.debug(vars)
    expect(vars.includes("template.variable")).toBeTruthy()
    expect(vars.includes("API[0].hasNewsletter")).toBeTruthy()
    expect(vars.includes("list")).toBeTruthy()
    expect(vars.includes("query")).toBeTruthy()

    // longed should come first
    expect(vars[0]).toBe('API[0].hasNewsletter')

})


test('Test RestUtil >  getAllVariables() > REST NEW', async () => {


    const rest = {
        "method" : "POST",
        "url" : "https://flowrabbit.de/test/users.json?${query}",
        "token" : "",
        "authType" : "Bearer",
        "input" : {
          "type" : "JSON",
          "fileDataBinding" : "",
          "template" : "${template.variable}"
        },
        "output" : {
          "databinding" : "list",
          "template" : "",
          "type" : "JSON",
          "hints" : {
            "<API[0]" : "Array",
            "<API[0]>id" : "Value",
            "<API[0]>email" : "Value",
            "<API[0]>name" : "Value",
            "<API[0]>lastname" : "Value",
            "<API[0]>has_newsletter" : "Value"
          }
        },
        "headers" : [ ],
        "isProxyEnabled" : true
    }

    const vars = RestUtil.getAllVariables(rest)
    console.debug(vars)
    expect(vars.includes("template.variable")).toBeTruthy()
    expect(vars.includes("API[0].has_newsletter")).toBeTruthy()
    expect(vars.includes("list")).toBeTruthy()
    expect(vars.includes("query")).toBeTruthy()

    // longed should come first
    expect(vars[0]).toBe('API[0].has_newsletter')

})


test('Test RestUtil >  buildHints() > REST', async () => {

    const vars = Object.keys(RestUtil.buildHints('API', {
        user: 'a',
        address: {
            'street_name': 1,
            'zip': 'pn'
        },
        children: [
            'Klaus'
        ],
        cats: [
            {
                type: 'cat',
                weight: 12
            }
        ]
    }))

    expect(vars.includes("<API>cats[0]>type")).toBeTruthy()
    expect(vars.includes("<API>address>zip")).toBeTruthy()
    
    expect(vars.includes("<API>cats[0]")).toBeTruthy()
    expect(vars.includes("<API>user")).toBeTruthy()
    console.debug(vars)
})
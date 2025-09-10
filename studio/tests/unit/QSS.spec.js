import QSS from '../../src/core/QSS'


test('Test QSS > 1', async () => {

    const model = {
        theme: {
            "@box-shadow-s" : {
                "value" : {
                    "v": 0,
                    "h": 0,
                    "b": 0,
                    "s": 0,
                    "i": false,
                    "c": "rgba(0,0,0,0.16)"
                },
                "type" : "fontSize"
            },
        }
    }
    const widget = {
        style: {
            boxShadow: "@box-shadow-s"
        }
    }
    QSS.replaceWidget(model, widget)
    expect(widget.style.boxShadow.c).toBe('rgba(0,0,0,0.16)')
})

test('Test QSS > 1', async () => {

    const model = {
        theme: {
            "@box-shadow-s": {"value": null, "type": "boxShadow"},
        }
    }
    const widget = {
        style: {
            boxShadow: "@box-shadow-s"
        }
    }
    QSS.replaceWidget(model, widget)
    expect(widget.style.boxShadow).toBe(null)
})

import QSS from '../../src/core/QSS'

test('Test DefaultStyles.replaceVariables() ', async () => {

    const widget = {
        qss: "Label",
        style: {
            color: "@label-color",
            fontSize: "@font-size-m",
            letterSpacing: 0
        }
    }

    const theme = QSS.getTheme("default")
    const updatedWidget = QSS.replaceVariables(theme, widget)
    expect(updatedWidget.style.color).toBe(theme['@label-color'].value)
    expect(updatedWidget.style.fontSize).toBe(theme['@font-size-m'].value)
    expect(updatedWidget.style.letterSpacing).toBe(0)
})

test('Test DefaultStyles.replaceValues() ', async () => {

    const theme = QSS.getTheme("default")
    const widget = {
        type: "Label",
        qss:{'fontSize': '@font-size-m', 'color': '@label-color'},
        style: {
            "fontSize": theme['@font-size-m'].value,
            "background": theme['@label-color'].value,
			"letterSpacing": 0,
			"color": theme['@label-color'].value
        }
    }

    const updatedWidget = QSS.resetVariables(theme, widget)
    expect(updatedWidget.style.color).toBe('@label-color')
    expect(updatedWidget.style.background).toBe(theme['@label-color'].value) // should not be changed
})
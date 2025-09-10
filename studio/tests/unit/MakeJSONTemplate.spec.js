
test('Test ChatgPT', async () => {
    
    let x = {template: JSON.stringify({
        "model": "@{model}",
        "messages": [
            {
                "role": "user",
                "content": "@{prompt}"
            }
        ],
        "temperature": 0.7
    })}
    console.debug(JSON.stringify(x))
})
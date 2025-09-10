import {chunk, getOverlapBackStep} from '../../src/util/ChunkyFunky'


test('ChunkyFunky.chunk() > ', async () => {

    let result = chunk('I am king Geedorah, take me to your leader. All hail the king! MF Doom, ALL CAPS!', 10)
    expect(result.length).toBe(9)
    expect(result[0]).toBe('I am king')
});

test('ChunkyFunky.chunk() > ', async () => {

    let result = chunk('AAA, BBBB CCCC DDDD EEEEE FFF GGG HHHH IIII JJJJJJ KKK', 10, 5)
    expect(result.length).toBe(6)
    expect(result[0]).toBe('AAA, BBBB')
});



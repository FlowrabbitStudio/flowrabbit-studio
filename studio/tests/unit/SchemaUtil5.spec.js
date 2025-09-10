import * as SchemaUtil from '../../src/core/SchemaUtil'


test('Test SchemaUtil > updateVaribale()', async () => {

    let result=''

    result = SchemaUtil.updateVariable("user.name", "user.name", "user.xxx")
    expect(result).toBe("user.xxx")

    result = SchemaUtil.updateVariable("user.name", "user", "xxx")
    expect(result).toBe("xxx.name")

    result = SchemaUtil.updateVariable("user.address.street", "user", "xxx")
    expect(result).toBe("xxx.address.street")

    result = SchemaUtil.updateVariable("user.address.street", "user.address", "user.xxx")
    expect(result).toBe("user.xxx.street")

    result = SchemaUtil.updateVariable("list[0].name", "abc", "xxx")
    expect(result).toBeUndefined()

    result = SchemaUtil.updateVariable("list", "abc", "xxx")
    expect(result).toBeUndefined()

    result = SchemaUtil.updateVariable("list[0].name", "list", "xxx")
    expect(result).toBe("xxx[0].name")

    result = SchemaUtil.updateVariable("list[0].name", "list.name", "xxx.name")
    expect(result).toBe("xxx[0].name")

    result = SchemaUtil.updateVariable("list[0].name", "list.name", "list.xxx")
    expect(result).toBe("list[0].xxx")


    result = SchemaUtil.updateVariable("API[0].email", "API.email", "API.xxx")
    expect(result).toBe("API[0].xxx")


    result = SchemaUtil.updateVariable("list.abc.def.asd", "yyy", "xxx")
    expect(result).toBeUndefined()


    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list.obj.sub", "list.obj.xxx")
    expect(result).toBe('list[1].obj.xxx[2].string')


    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list.obj.sub.string", "list.obj.sub.xxx")
    expect(result).toBe('list[1].obj.sub[2].xxx')

    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list.obj", "list.xxx")
    expect(result).toBe('list[1].xxx.sub[2].string')

    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list.obj2", "list.xxx")
    expect(result).toBeUndefined()

    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list.obj", "list.xxx")
    expect(result).toBe('list[1].xxx.sub[2].string')

    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "listx.obj", "listx.xxx")
    expect(result).toBeUndefined()

    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list[1].objX.sub[2].string", "list[1].obj.sub[2].xxx")
    expect(result).toBeUndefined()

    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list[1].obj.subX[2].string", "list[1].obj.sub[2].xxx")
    expect(result).toBeUndefined()

    result = SchemaUtil.updateVariable("list[1].obj.sub[2].string", "list[1].obj.sub[2].Xstring", "list[1].obj.sub[2].xxx")
    expect(result).toBeUndefined()

    console.debug(result)
    //SchemaUtil.print(schema)
})


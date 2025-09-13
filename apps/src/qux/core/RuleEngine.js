import Logger from "./Logger";

export function isValueMatchingRule(value, operator, expected) {



    value = fixValueType(value)
    expected = fixValueType(expected)
    let result = false;

    switch (operator) {
        case "contains":
            if (value.toLowerCase && expected.toLowerCase) {
                const lowerValue = value.toLowerCase();
                const lowerRule = expected.toLowerCase();
                result = lowerValue.indexOf(lowerRule) >= 0;
            } else {
                result = false;
            }
            break;

        case 'empty':
            result = isEmpty(value);
            break;

        case 'notEmpty':
            result = !isEmpty(value);
            break;    

        case "==":
            result = (value == expected);
            break;

        case "!=":
            if (expected === null || expected === undefined) {
                result = value !== null && value !== undefined && value !== ''
            } else {
                result = (value != expected);
            }
            break;

        case ">":
            if (!value) {
                value = 0;
            }
            result = (value * 1 > expected * 1);
            break;

        case "<":
            if (!value) {
                value = 0;
            }
            result = (value * 1 < expected * 1);
            break;

        case ">=":
            if (!value) {
                value = 0;
            }
            result = (value * 1 >= expected * 1);
            break;

        case "<=":
            if (!value) {
                value = 0;
            }
            result = (value * 1 <= expected * 1);
            break;

        default:
            Logger.warn('RuleEngine.isValueMatchingRule() Not supported operator')
    }

    Logger.log(-44, 'RuleEngine.isValueMatchingRule() > enter > ' + operator + ' >> ' + result);
    return result;
}

function isEmpty(value) {
    if (Array.isArray(value)) {
        return value.length == 0;
    } else {
        return value !== null || value !== undefined || value !== '' || value !== false;
    }
}

function fixValueType(value) {
    if (value == 'true') {
        return true
    }
    if (value == 'false') {
        return false
    }
    if (value == undefined) {
        return false
    }
    return value
}